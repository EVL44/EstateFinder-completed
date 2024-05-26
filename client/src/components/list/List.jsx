import './list.scss';
import Card from '../card/Card';

function List({ posts, refetchPosts }) {
  return (
    <div className='list'>
      {posts.map(item => (
        <Card key={item.id} item={item} refetchPosts={refetchPosts} />
      ))}
    </div>
  );
}

export default List;
