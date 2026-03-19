# Barbearia do César - Sistema de Gestão

Sistema completo de gestão para barbearias com agendamentos, PDV, caixa e relatórios.

## Estrutura do Projeto

```
src/
├── App.jsx                          # Componente principal
├── main.jsx                         # Ponto de entrada React
├── index.css                        # Estilos globais
├── components/                      # Componentes reutilizáveis
│   ├── CoverScreen.jsx             # Tela inicial
│   ├── Sidebar.jsx                 # Menu lateral
│   └── CheckoutModal.jsx           # Modal de pagamento
├── pages/                          # Páginas/Telas principais
│   ├── AgendaView.jsx             # Agenda de agendamentos
│   ├── POSView.jsx                # Sistema de PDV/Comandas
│   ├── ReportsView.jsx            # Caixa e relatórios
│   └── SettingsView.jsx           # Configurações
├── constants/                      # Dados constantes
│   └── initialData.js             # Dados iniciais
└── utils/                          # Funções auxiliares
    └── helpers.js                  # Funções reutilizáveis
```

## Funcionalidades

### 📅 Agenda de Agendamentos
- Agendar novos cortes/serviços
- Definir horário e profissional
- Gerenciar lista de espera (encaixe)
- Validação de conflito de horário
- Iniciar atendimento

### 💳 Ponto de Venda (PDV)
- Adicionar serviços à comanda
- Adicionar produtos/bebidas
- Controle de estoque
- Aplicar descontos por fidelidade
- Múltiplas formas de pagamento (PIX, Cartão, Dinheiro)

### 📊 Caixa & Relatórios
- Saldo total do caixa
- Recebimentos por forma de pagamento
- Histórico de transações
- Fluxo manual (entradas/saídas)
- Cálculo de comissões por barbeiro

### ⚙️ Configurações
- Gerenciar tabela de serviços
- Gerenciar produtos/bebidas
- Controle de estoque
- Preços customizáveis

## Instalação e Uso

Veja o arquivo [SETUP.md](./SETUP.md) para instruções completas.

**Resumo rápido:**
```bash
npm install
npm run dev
```

## Tecnologias

- **React 18** - UI framework
- **Vite** - Build tool & dev server
- **Tailwind CSS** - Styling
- **Lucide React** - Icon library
- **JavaScript ES6+** - Linguagem

## Dados Iniciais

O sistema vem com dados de exemplo:
- 2 Barbeiros (César e Rodrigo)
- 5 Serviços (cortes, barba, sobrancelha)
- 4 Produtos (cervejas, bebidas, pomadas)
- 2 Clientes cadastrados

Todos podem ser editados na seção de Configurações.

## Estados Gerenciados

O app usa React Hooks para gerenciar:
- Estados globais (abas ativas, dados)
- Dados de agendamentos
- Dados de transações
- Estoque de produtos
- Comissões de barbeiros

## Melhorias Futuras

- [ ] Persistência em banco de dados
- [ ] Autenticação de usuários
- [ ] Backup/Export de dados
- [ ] Relatórios avançados por período
- [ ] Dashboard com gráficos
- [ ] Notificações de agendamentos
- [ ] App mobile
- [ ] Integração com WhatsApp

## Licença

Projeto privado da Barbearia do César.

---

Desenvolvido com ❤️ para Barbearia do César
