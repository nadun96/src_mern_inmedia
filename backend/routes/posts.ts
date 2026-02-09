import express, { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();
const prisma = new PrismaClient();

// GET /posts - Get all posts
router.get('/', async (request: Request, response: Response) => {
  try {
    const posts = await prisma.post.findMany({
      orderBy: { createdAt: 'desc' }
    });
    response.status(200).json(posts);
  } catch (error) {
    console.error('Get posts error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// GET /posts/:id - Get single post by id
router.get('/:id', async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const post = await prisma.post.findUnique({
      where: { id: id as string }
    });

    if (!post) {
      response.status(404).json({ error: 'Post not found' });
      return;
    }

    response.status(200).json(post);
  } catch (error) {
    console.error('Get post error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// POST /posts - Create a new post (protected route)
router.post('/', authenticateToken, async (request: Request, response: Response) => {
  try {
    const { title, body, image } = request.body;

    // Validate input
    if (!title || !body) {
      response.status(400).json({ error: 'Title and body are required' });
      return;
    }

    // Create post
    const newPost = await prisma.post.create({
      data: {
        title,
        body,
        image: image || '',
        authorId: request.user!.userId
      }
    });

    response.status(201).json({
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// PUT /posts/:id - Update a post (protected route)
router.put('/:id', authenticateToken, async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const { title, body, image } = request.body;

    // Find post
    const post = await prisma.post.findUnique({
      where: { id: id as string }
    });

    if (!post) {
      response.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if user is the author
    if (post.authorId !== request.user!.userId) {
      response.status(403).json({ error: 'Unauthorized - only author can update this post' });
      return;
    }

    // Update post
    const updatedPost = await prisma.post.update({
      where: { id: id as string },
      data: {
        title: title || post.title,
        body: body || post.body,
        image: image !== undefined ? image : post.image
      }
    });

    response.status(200).json({
      message: 'Post updated successfully',
      post: updatedPost
    });
  } catch (error) {
    console.error('Update post error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

// DELETE /posts/:id - Delete a post (protected route)
router.delete('/:id', authenticateToken, async (request: Request, response: Response) => {
  try {
    const { id } = request.params;

    // Find post
    const post = await prisma.post.findUnique({
      where: { id: id as string }
    });

    if (!post) {
      response.status(404).json({ error: 'Post not found' });
      return;
    }

    // Check if user is the author
    if (post.authorId !== request.user!.userId) {
      response.status(403).json({ error: 'Unauthorized - only author can delete this post' });
      return;
    }

    // Delete post
    await prisma.post.delete({
      where: { id: id as string }
    });

    response.status(200).json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Delete post error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
