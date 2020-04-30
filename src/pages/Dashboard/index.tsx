import React, { useState, useEffect } from 'react';

import { format, parseISO } from 'date-fns';

import income from '../../assets/income.svg';
import outcome from '../../assets/outcome.svg';
import total from '../../assets/total.svg';

import api from '../../services/api';

import Header from '../../components/Header';

import formatValue from '../../utils/formatValue';

import { Container, CardContainer, Card, TableContainer } from './styles';

interface Transaction {
  id: string;
  title: string;
  value: number;
  formattedValue: string;
  formattedDate: string;
  type: 'income' | 'outcome';
  category: { title: string };
  created_at: string;
}

interface Balance {
  income: string;
  outcome: string;
  total: string;
}

const Dashboard: React.FC = () => {
  const [transactions, setTransactions] = useState<Transaction[] | null>([]);
  const [balance, setBalance] = useState<Balance>({} as Balance);

  useEffect(() => {
    async function loadTransactions(): Promise<void> {
      const transactionsReport = await api.get('/transactions');

      if (transactionsReport && transactionsReport.data) {
        const {
          balance: balanceResponse,
          transactions: transactionsResponse,
        } = transactionsReport.data;

        const parsedTransactions: Transaction[] = transactionsResponse.map(
          (transaction: Transaction) => {
            const parsedTransaction = {
              ...transaction,
              formattedDate: format(
                parseISO(transaction.created_at),
                'dd/MM/yy',
              ),
              formattedValue: formatValue(transaction.value),
            };
            return parsedTransaction;
          },
        );

        const parsedBalance = {
          income: formatValue(balanceResponse.income || 0),
          outcome: formatValue(balanceResponse.outcome || 0),
          total: formatValue(balanceResponse.total || 0),
        };

        setBalance(parsedBalance);
        setTransactions(parsedTransactions);
      }
    }

    loadTransactions();
  }, []);

  return (
    <>
      <Header />
      <Container>
        <CardContainer>
          <Card>
            <header>
              <p>Entradas</p>
              <img src={income} alt="Income" />
            </header>
            <h1 data-testid="balance-income">{balance.income}</h1>
          </Card>
          <Card>
            <header>
              <p>Saídas</p>
              <img src={outcome} alt="Outcome" />
            </header>
            <h1 data-testid="balance-outcome">{balance.outcome}</h1>
          </Card>
          <Card total>
            <header>
              <p>Total</p>
              <img src={total} alt="Total" />
            </header>
            <h1 data-testid="balance-total">{balance.total}</h1>
          </Card>
        </CardContainer>

        <TableContainer>
          <table>
            <thead>
              <tr>
                <th>Título</th>
                <th>Preço</th>
                <th>Categoria</th>
                <th>Data</th>
              </tr>
            </thead>

            <tbody>
              {transactions &&
                transactions.map(transaction => (
                  <tr key={transaction.id}>
                    <td className="title">{transaction.title}</td>
                    <td className={transaction.type}>
                      {transaction.type === 'outcome' && ' - '}
                      {transaction.formattedValue}
                    </td>
                    <td>{transaction.category.title}</td>
                    <td>{transaction.formattedDate}</td>
                  </tr>
                ))}
            </tbody>
          </table>
        </TableContainer>
      </Container>
    </>
  );
};

export default Dashboard;
