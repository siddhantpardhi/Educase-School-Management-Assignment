import mysql from "mysql2"
import dotenv from "dotenv"
import { validationResult } from "express-validator";

dotenv.config({
    path: "./.env"
})

let getPool

export const connectDB = async() => {
    try {
        const connection = mysql.createConnection({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            port: process.env.MYSQLPORT
          }).promise();
        
         await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.MYSQLDATABASE};`);
         await connection.end();
        
        const pool = mysql.createPool({
            host: process.env.MYSQLHOST,
            user: process.env.MYSQLUSER,
            password: process.env.MYSQLPASSWORD,
            database: process.env.MYSQLDATABASE,
            port: process.env.MYSQLPORT
        }).promise()
        
        // console.log("Connection Pool: ", pool)
        
        const result = await pool.query(`CREATE TABLE IF NOT EXISTS ${process.env.MYSQLTABLE}( 
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(50) NOT NULL,
            address VARCHAR(100) NOT NULL,
            longitude FLOAT NOT NULL,
            latitude FLOAT NOT NULL
        )`)
    
        getPool = () => { return pool }
        
        // console.log("Result: ",result)
    } catch (error) {
        console.error("Error while connecting to database: ", error);
        
    }
}

export const addSchool = async (req,res) => {

  try {

    const { name, address, longitude, latitude } = req.body

    if(typeof name !== "string" || typeof address !== "string") {
        return res.status(400).json({ status: 400, message: "Name and Address should be string"})
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    let pool = getPool()
  
    const result = await pool.query(`INSERT INTO schools (
          name,
          address,
          longitude,
          latitude
      )
      VALUES(
          ?,
          ?,
          ?,
          ?
      )`, [name, address, longitude, latitude])
  
    //   console.log("Result: ", result[0].insertId)

      const id = result[0].insertId

      const [addedSchool] = await pool.query(`SELECT name, address, longitude, latitude FROM schools where id = ?`, [id])
    //   console.log("addedSchool: ", addedSchool[0])
  
      res.status(200).json({
        status: 200,
        message: "School Added Successfully",
        addedSchool: addedSchool[0]
    })
  } catch (error) {
    console.error("Error while inserting city: ", error);
    
  }
}

export const listSchools = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
  
    const { latitude, longitude } = req.query;
  
    try {

      let pool = getPool()
      const [rows] = await pool.query(
        `SELECT
          id,
          name,
          address,
          latitude,
          longitude,
          ROUND(
            6371 * ACOS(
              COS(RADIANS(?)) * COS(RADIANS(latitude)) *
              COS(RADIANS(longitude) - RADIANS(?)) +
              SIN(RADIANS(?)) * SIN(RADIANS(latitude))
            ), 2
          ) AS distance_km
        FROM
          schools
        ORDER BY
          distance_km;`,
        [latitude, longitude, latitude]
      );
  
      res.status(200).json({
        status: 200,
        message: "Schools Near You",
        noOfSchools: rows.length,
        schools: rows
    });
    } catch (error) {
      console.error('Error fetching schools:', error);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  };