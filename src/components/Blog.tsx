import React from 'react';
import { Box, Typography, Paper, Button } from '@mui/material';
import { Link } from 'react-router-dom';

interface Post {
  title: string;
  content: string;
  image?: string;
}

interface BlogProps {
  posts: Post[];
  ownerId: string;
  onDelete: (index: number) => void;
  showEditButtons: boolean;
}

const Blog: React.FC<BlogProps> = ({ posts, ownerId, onDelete, showEditButtons }) => {
  return (
    <Paper elevation={3} sx={{ padding: 2, marginBottom: 4 }}>
      <Typography variant="h6" gutterBottom>
        Blog
      </Typography>
      <Box sx={{ maxHeight: '300px', overflowY: 'auto', padding: 2 }}>
        {posts && posts.length > 0 ? (
          posts.map((post, index) => (
            <Paper key={index} elevation={2} sx={{ padding: 2, marginBottom: 2 }}>
              <Link to={`/blog/${ownerId}/${index}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <Typography variant="h6">{post.title}</Typography>
              </Link>
              <div dangerouslySetInnerHTML={{ __html: post.content }} />
              {post.image && <img src={post.image} alt="Blog" style={{ maxWidth: '100px', height: 'auto', marginTop: '10px', borderRadius: '8px' }} />}
              {showEditButtons && (
                <>
                  <Link to={`/blog/${ownerId}/${index}/edit`} style={{ textDecoration: 'none', color: 'inherit' }}>
                    <Button variant="outlined" color="primary" sx={{ mt: 2 }}>
                      Edit Post
                    </Button>
                  </Link>
                  <Button variant="outlined" color="secondary" sx={{ mt: 2, ml: 2 }} onClick={() => onDelete(index)}>
                    Delete Post
                  </Button>
                </>
              )}
            </Paper>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary">
            No blog posts available.
          </Typography>
        )}
      </Box>
    </Paper>
  );
};

export default Blog;
