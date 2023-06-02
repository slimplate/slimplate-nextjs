import Content from '@slimplate/content'

export default async function PageBlog () {
  const content = new Content('blog')
  const blogs = await Promise.all((await content.list()).map(f => content.get(f)))
  console.log('blogs', blogs)
  return (
    <main>
      <div>
        This is blog
        <ul>
          <li><a href='/blog/a'>a</a></li>
          <li><a href='/blog/b'>b</a></li>
          <li><a href='/blog/c'>c</a></li>
          <li><a href='/blog/d'>d</a></li>
          <li><a href='/blog/e'>e</a></li>
          <li><a href='/blog/f'>f</a></li>
        </ul>
      </div>
    </main>
  )
}
