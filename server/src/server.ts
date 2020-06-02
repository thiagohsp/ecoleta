import express from 'express';

const app = express();

app.get('/users', (req, res) => {
  console.log('Listagem de usuarios');  
})

app.listen(3333)