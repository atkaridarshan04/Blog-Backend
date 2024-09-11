import Post from './post.model.js';
import Tag from './tag.model.js';

Post.belongsToMany(Tag, { through: 'PostTag', as: 'tags' });
Tag.belongsToMany(Post, { through: 'PostTag', as: 'posts' });
