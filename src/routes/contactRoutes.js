// const express = require("express");
// const fs = require("fs");
// const router = express.Router();

// const filePath = "./data/contacts.json";

// //Gest semua kontak
// router.get("/", (req, res) => {
//   const contacts = JSON.parse(fs.readFileSync(filePath));
//   res.json(contacts);
// });

// //Get satu kontak
// router.get("/:id", (req, res) => {
//   const contacts = JSON.parse(fs.readFileSync(filePath));
//   const contact = contacts.find((c) => c.id === req.params.id);
//   if (!contact) return res.status(404).json({ message: "Contact not found" });
//   res.json(contact);
// });

// //Tambah kontak baru
// router.post("/", (req, res) => {
//   const contacts = JSON.parse(fs.readFileSync(filePath));
//   const newContact = {
//     id: Date.now(),
//     name: req.body.name,
//     email: req.body.email,
//     phone: req.body.phone,
//   };
//   contacts.push(newContact);
//   fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
//   res.status(201).json(newContact);
// });

// //Update kontak
// router.put("/:id", (req, res) => {
//   const contacts = JSON.parse(fs.readFileSync(filePath));
//   const index = contacts.findIndex((c) => c.id === parseInt(req.params.id));
//   if (index === -1)
//     return res.status(404).json({ message: "Contact not found" });

//   contacts[index] = { ...contacts[index], ...req.body };
//   fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
//   res.json(contacts[index]);
// });

// //Hapus kontak
// router.delete("/:id", (req, res) => {
//   let contacts = JSON.parse(fs.readFileSync(filePath));
//   contacts = contacts.filter((c) => c.id !== parseInt(req.params.id));
//   fs.writeFileSync(filePath, JSON.stringify(contacts, null, 2));
//   res.json({ message: "Contact deleted" });
// });

// module.exports = router;
