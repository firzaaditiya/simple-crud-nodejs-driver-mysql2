import mysql from "mysql2/promise"

/**
 * Method yang mengembalikan koneksi ke database atau mendapatkan koneksi ke MySQL
 */
export const getConnection = async () => {
    const connection = await mysql.createConnection({
        host: process.env.HOST,
        user: process.env.DB_USER,
        password: process.env.DB_PASS,
        database: process.env.DATABASE
    })

    return connection
}