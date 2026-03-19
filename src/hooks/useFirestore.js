import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  getDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

/**
 * Hook para persistir um valor simples (string, número, etc) no Firestore.
 * Salva em um documento único na coleção 'settings'.
 */
export function useFirestoreSetting(key, defaultValue) {
  const [value, setValueLocal] = useState(defaultValue);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const docRef = doc(db, 'settings', key);
    const unsubscribe = onSnapshot(docRef, (snap) => {
      if (snap.exists()) {
        setValueLocal(snap.data().value);
      }
      setLoaded(true);
    });
    return () => unsubscribe();
  }, [key]);

  const setValue = useCallback((newVal) => {
    const v = typeof newVal === 'function' ? newVal(value) : newVal;
    setValueLocal(v);
    setDoc(doc(db, 'settings', key), { value: v });
  }, [key, value]);

  return [value, setValue, loaded];
}

// Converte Timestamps do Firestore para Date do JS
function fromFirestore(data) {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Timestamp) {
      result[key] = result[key].toDate();
    }
  }
  return result;
}

// Converte Dates do JS para Timestamps do Firestore
function toFirestore(data) {
  const result = { ...data };
  for (const key of Object.keys(result)) {
    if (result[key] instanceof Date) {
      result[key] = Timestamp.fromDate(result[key]);
    }
  }
  return result;
}

/**
 * Hook que sincroniza um estado React com uma coleção do Firestore.
 * - Escuta mudanças em tempo real
 * - Ao chamar setData, salva automaticamente no Firestore
 */
export function useFirestoreCollection(collectionName, initialData = []) {
  const [data, setDataLocal] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const isFirstLoad = useRef(true);
  const skipNextSync = useRef(false);

  // Escutar mudanças no Firestore em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, collectionName), (snapshot) => {
      if (snapshot.empty && isFirstLoad.current) {
        // Coleção vazia no Firebase — usar dados iniciais e fazer upload
        if (initialData.length > 0) {
          const batch = writeBatch(db);
          initialData.forEach(item => {
            const docRef = doc(db, collectionName, String(item.id));
            batch.set(docRef, toFirestore(item));
          });
          batch.commit();
        }
        isFirstLoad.current = false;
        setLoaded(true);
        return;
      }

      isFirstLoad.current = false;
      const docs = snapshot.docs.map(d => fromFirestore({ ...d.data(), id: d.id }));
      skipNextSync.current = true;
      setDataLocal(docs);
      setLoaded(true);
    });

    return () => unsubscribe();
  }, [collectionName]);

  // Função para atualizar dados — salva no Firestore automaticamente
  const setData = useCallback((newDataOrFn) => {
    setDataLocal(prev => {
      const newData = typeof newDataOrFn === 'function' ? newDataOrFn(prev) : newDataOrFn;

      // Sync com Firestore
      if (!skipNextSync.current) {
        syncToFirestore(collectionName, prev, newData);
      }
      skipNextSync.current = false;

      return newData;
    });
  }, [collectionName]);

  return [data, setData, loaded];
}

// Sincroniza diferenças entre estado anterior e novo com o Firestore
async function syncToFirestore(collectionName, oldData, newData) {
  const batch = writeBatch(db);
  const oldIds = new Set(oldData.map(item => String(item.id)));
  const newIds = new Set(newData.map(item => String(item.id)));

  // Adicionar/atualizar
  for (const item of newData) {
    const docRef = doc(db, collectionName, String(item.id));
    batch.set(docRef, toFirestore(item));
  }

  // Remover itens que não existem mais
  for (const id of oldIds) {
    if (!newIds.has(id)) {
      batch.delete(doc(db, collectionName, id));
    }
  }

  await batch.commit();
}
