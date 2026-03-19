import { useState, useEffect, useCallback, useRef } from 'react';
import { db } from '../firebase';
import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  writeBatch,
  Timestamp,
} from 'firebase/firestore';

/**
 * Hook para persistir um valor simples (string, número, etc) no Firestore.
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
    setDoc(doc(db, 'settings', key), { value: v }).catch(err =>
      console.error(`Erro ao salvar setting ${key}:`, err)
    );
  }, [key, value]);

  return [value, setValue, loaded];
}

// Converte Timestamps do Firestore para Date do JS (recursivo)
function deepFromFirestore(val) {
  if (val instanceof Timestamp) return val.toDate();
  if (Array.isArray(val)) return val.map(deepFromFirestore);
  if (val && typeof val === 'object' && val.constructor === Object) {
    const result = {};
    for (const k of Object.keys(val)) {
      result[k] = deepFromFirestore(val[k]);
    }
    return result;
  }
  return val;
}

// Converte Dates do JS para formato Firestore (recursivo)
function deepToFirestore(val) {
  if (val instanceof Date) return Timestamp.fromDate(val);
  if (Array.isArray(val)) return val.map(deepToFirestore);
  if (val && typeof val === 'object' && val.constructor === Object) {
    const result = {};
    for (const k of Object.keys(val)) {
      result[k] = deepToFirestore(val[k]);
    }
    return result;
  }
  return val;
}

/**
 * Hook que sincroniza um estado React com uma coleção do Firestore.
 */
export function useFirestoreCollection(collectionName, initialData = []) {
  const [data, setDataLocal] = useState(initialData);
  const [loaded, setLoaded] = useState(false);
  const seeded = useRef(false);
  const latestData = useRef(initialData);

  // Manter ref atualizada
  useEffect(() => {
    latestData.current = data;
  }, [data]);

  // Escutar mudanças no Firestore em tempo real
  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, collectionName),
      (snapshot) => {
        // Coleção vazia — fazer upload dos dados iniciais
        if (snapshot.empty && !seeded.current && initialData.length > 0) {
          seeded.current = true;
          const batch = writeBatch(db);
          initialData.forEach(item => {
            batch.set(doc(db, collectionName, String(item.id)), deepToFirestore(item));
          });
          batch.commit().catch(err =>
            console.error(`Erro ao fazer seed de ${collectionName}:`, err)
          );
          return;
        }

        const docs = snapshot.docs.map(d => {
          const docData = d.data();
          return deepFromFirestore({ ...docData, id: d.id });
        });
        latestData.current = docs;
        setDataLocal(docs);
        setLoaded(true);
      },
      (error) => {
        console.error(`Firestore listener error (${collectionName}):`, error);
        setLoaded(true);
      }
    );

    return () => unsubscribe();
  }, [collectionName]);

  // Função para atualizar dados — salva no Firestore
  const setData = useCallback((newDataOrFn) => {
    const prev = latestData.current;
    const newData = typeof newDataOrFn === 'function' ? newDataOrFn(prev) : newDataOrFn;

    // Atualizar estado local imediatamente
    latestData.current = newData;
    setDataLocal(newData);

    // Sincronizar com Firestore (fora do state updater)
    const prevIds = new Set(prev.map(i => String(i.id)));
    const newIds = new Set(newData.map(i => String(i.id)));

    // Escrever itens novos/modificados
    const writePromises = newData.map(item =>
      setDoc(doc(db, collectionName, String(item.id)), deepToFirestore(item))
        .catch(err => console.error(`Erro ao salvar ${collectionName}/${item.id}:`, err))
    );

    // Deletar itens removidos
    for (const id of prevIds) {
      if (!newIds.has(id)) {
        writePromises.push(
          deleteDoc(doc(db, collectionName, id))
            .catch(err => console.error(`Erro ao deletar ${collectionName}/${id}:`, err))
        );
      }
    }
  }, [collectionName]);

  return [data, setData, loaded];
}
