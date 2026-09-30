import { db } from '../loaders/loadPostgres.js'

export async function getUsersDB(start: number, end: number) {
  const dataQuery = `SELECT * FROM users ORDER BY created_at LIMIT $2 OFFSET $1`
  const countQuery = `SELECT COUNT(id) FROM users AS total`
  const values = [start, end]
  const [dataResult, countResult] = await Promise.all([
    db.query(dataQuery, values),
    db.query(countQuery),
  ])

  const result = dataResult.rows
  const totalUsers = parseInt(countResult.rows[0].total)
  const totalPages = Math.ceil(totalUsers / end)
  const pagesLeft = Math.max(0, totalPages - start)

  return { result, totalUsers, totalPages, pagesLeft }
}
