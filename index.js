import express from "express"
const app = express()

import methodOverride from "method-override"
import path from "path"
import { v4 as uuidv4 } from "uuid"

import * as DB from "./config/database.js"

import dotenv from "dotenv"
dotenv.config()

app.use(methodOverride("_method"))
app.use(express.urlencoded({
    extended: true
}))

app.set("view engine", "ejs")
app.set("views", path.join(process.cwd(), "/views"))

app.get("/", (req, res) => {
    res.send("Hello World !")
})

/**
 * Implementasi CRUD dengan MySQL Connector (MySQL2) dengan NodeJS
 * Docs MySQL2 : https://sidorares.github.io/node-mysql2/docs/documentation
 * NPM : https://www.npmjs.com/package/mysql2
 */

/**
 * READ DATA (R)
 */
app.get("/products", async (req ,res) => {
    let connection = null
    const { category } = req.query

    try {
        /**
         * Melakukan koneksi ke database dan mendapatkan koneksinya
         */
        connection = await DB.getConnection()

        if (category) {
            const sql = "SELECT id, name, brand, price, color, category FROM products WHERE category = ?"

            const stmt = await connection.prepare(sql)
            const [result, fields] = await stmt.execute([category])
            await stmt.close()

            res.render("products/index", {
                products: result,
                category: category
            })
        } else {
            /**
             * Membuat query untuk mendapatkan sebuah data
             */
            const sql = "SELECT id, name, brand, price, color, category FROM products"

            /**
             * Melakukan sebuah query simpel
             */
            const [result, fields] = await connection.query(sql)

            res.render("products/index", {
                products: result,
                category: "All"
            })
        }
    } catch (error) {
        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        /**
         * Menutup koneksi ketika proses kueri sudah selesai
         */
        await connection.end().then(() => {
            console.info("The connection to the database has been successfully closed")
        }).catch((error) => {
            console.info("Failed to close the connection to the database")

            /**
             * Menampilkan pesan error
             */
            console.error(error)
        })
    }
})


app.get("/products/create", (req, res) => {
    res.render("products/create")
})

app.get("/products/:id", async (req, res) => {
    const { id } = req.params
    let connection = null

    try {
        connection = await DB.getConnection()

        const sql = "SELECT id, name, brand, price, color, category FROM products WHERE id = ?"
        
        /**
         * Menggunakan prepare statement untuk memimimalisir celah SQL Injection
         */
        const stmt = await connection.prepare(sql)

        /**
         * Proses eksekusi query dan bind params (value) juga proses mendapatkan data dan destructuring
         */
        const [result, fields] = await stmt.execute([id])

        /**
         * Membebaskan sumber daya yang terkait dengan prepared statement setelah selesai digunakan. Ini adalah praktik yang
         * baik untuk memastikan bahwa sumber daya yang dialokasikan untuk prepared statement dilepaskan dan tidak menyebabkan
         * kebocoran sumber daya atau penumpukan memori yang tidak perlu.
         */
        await stmt.close()

        if (result.length < 1) {
            res.send("Product not found")
        } else {
            const [ product ] = result

            res.render("products/show", {
                product
            })
        }
    } catch (error) {
        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        await connection.end()
    }
})

/**
 * CREATE DATA (C)
 */
app.post("/products", async (req, res) => {
    let connection = null
    const { name, brand, price, color, category } = req.body

    try {
        connection = await DB.getConnection()

        const sql = "INSERT INTO products (id, name, brand, price, color, category) VALUES (?, ?, ?, ?, ?, ?)"

        /**
         * Start transaction
         */
        await connection.beginTransaction()

        const stmt = await connection.prepare(sql)
        await stmt.execute([uuidv4(), name, brand, price, color, category])
        await stmt.close()

        /**
         * Commit transaction
         */
        await connection.commit()

        res.redirect("/products")
    } catch (error) {
        /**
         * Rollback transaction
         */
        await connection.rollback()

        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        await connection.end()
    }
})

app.get("/products/:id/edit", async (req, res) => {
    let connection = null
    const { id } = req.params

    try {
        connection = await DB.getConnection()

        const sql = "SELECT id, name, brand, price, color, category FROM products WHERE id = ?"

        const stmt = await connection.prepare(sql)
        const [ result, fields ] = await stmt.execute([id])
        await stmt.close()

        if (result.length < 1) {
            res.send("Product not found")
        } else {
            const [ product ] = result

            res.render("products/edit", {
                product
            })
        }
    } catch (error) {
        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        await connection.end()
    }
})

/**
 * UPDATE DATA (U)
 */
app.put("/products/:id", async (req, res) => {
    let connection = null
    const { id } = req.params
    const { name, brand, price, color, category } = req.body

    try {
        connection = await DB.getConnection()

        const sql = "UPDATE products SET name = ?, brand = ?, price = ?, color = ?, category = ? WHERE id = ?"

        await connection.beginTransaction()

        const stmt = await connection.prepare(sql)
        await stmt.execute([name, brand, price, color, category, id])
        await stmt.close()

        await connection.commit()

        res.redirect(`/products/${id}`)
    } catch (error) {
        await connection.rollback()

        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        await connection.end()
    }
})

/**
 * DELETE DATA (D)
 */
app.delete("/products/:id", async (req, res) =>{
    let connection = null
    const { id } = req.params

    try {
        connection = await DB.getConnection()

        const sql = "DELETE FROM products WHERE id = ?"

        await connection.beginTransaction()

        const stmt = await connection.prepare(sql)
        await stmt.execute([id])
        await stmt.close()

        await connection.commit()

        res.redirect("/products")
    } catch (error) {
        await connection.rollback()

        res.status(500).send("The query process is failed")
        console.error(error)
    } finally {
        await connection.end()
    }
})

app.listen(process.env.PORT)