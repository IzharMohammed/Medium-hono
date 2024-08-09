import { Hono } from 'hono'

const app = new Hono()

app.get('/', (c) => {
  return c.text('Hello Hono!')
})

app.post('/api/v1/user/signup', (c) => {
  return c.text('i am in !!!')
})

app.post('/api/v1/user/signin', (c) => {
  return c.text('i am in 1 !!!')
})

app.post('/api/v1/blog', (c) => {
  return c.text('i am in 2 !!!')
})


app.put('/api/v1/blog', (c) => {
  return c.text('i am in 3 !!!')
})

app.get('/api/v1/blog/:id', (c) => {
  const id = c.req.param('id')

  return c.text(`id is :- ${id}`)
})

app.post('/api/v1/blog/bulk', (c) => {
  return c.text('i am in 4 !!!')
})

export default app
