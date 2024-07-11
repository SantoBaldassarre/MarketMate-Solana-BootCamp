import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { db, doc, getDoc } from '../firebase';
import { Container, Typography, Paper, Box } from '@mui/material';

const BlogPostPage = () => {
  const { id, index } = useParams();
  const [post, setPost] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const docRef = doc(db, 'users', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          if (data.blog && data.blog[index]) {
            setPost(data.blog[index]);
          } else {
            setError('Blog post not found');
          }
        } else {
          setError('Business owner not found');
        }
      } catch (error) {
        setError('Error fetching blog post');
        console.error('Error fetching blog post:', error);
      }
    };

    fetchPost();
  }, [id, index]);

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6" color="error">
          {error}
        </Typography>
      </Container>
    );
  }

  if (!post) {
    return (
      <Container maxWidth="md" sx={{ mt: 4 }}>
        <Typography variant="h6">
          Loading...
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 4 }}>
      <Paper elevation={3} sx={{ padding: 4 }}>
        <Typography variant="h4" gutterBottom>
          {post.title}
        </Typography>
        <Box sx={{ width: '100%', maxHeight: '600px', overflowY: 'auto' }}>
          <div dangerouslySetInnerHTML={{ __html: post.content }} />
          {post.image && <img src={post.image} alt="Blog" style={{ maxWidth: '100%', height: 'auto', marginTop: '10px', borderRadius: '8px' }} />}
        </Box>
      </Paper>
    </Container>
  );
};

export default BlogPostPage;
