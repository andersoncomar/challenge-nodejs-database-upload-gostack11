import { getCustomRepository, getRepository } from 'typeorm';

import AppError from '../errors/AppError';
import TransactionsRepository from '../repositories/TransactionsRepository';

import Transaction from '../models/Transaction';
import Category from '../models/Category';

interface Request {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class CreateTransactionService {
  public async execute({
    title,
    value,
    type,
    category,
  }: Request): Promise<Transaction> {
    const transactionsRepository = getCustomRepository(TransactionsRepository);
    const categoriesRepository = getRepository(Category);

    if (type !== 'income' && type !== 'outcome') {
      throw new AppError('Type is incorret.');
    }

    const balance = await transactionsRepository.getBalance();

    if (type === 'outcome' && value > balance.total) {
      throw new AppError('Without value for transaction.');
    }

    let categoryExists = await categoriesRepository.findOne({
      where: { title: category },
    });

    if (!categoryExists) {
      categoryExists = await categoriesRepository.create({
        title: category,
      });

      await categoriesRepository.save(categoryExists);
    }

    const transaction = await transactionsRepository.create({
      title,
      value,
      type,
      category: categoryExists,
    });

    await transactionsRepository.save(transaction);

    return transaction;
  }
}

export default CreateTransactionService;
