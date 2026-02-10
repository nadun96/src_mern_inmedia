import express, { Router, type Request, type Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router: Router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /posts:
 *   get:
 *     summary: Get all posts with pagination
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number (starts at 1)
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of posts per page
 *     responses:
 *       200:
 *         description: List of posts with author details and pagination info
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       title:
 *                         type: string
 *                       body:
 *                         type: string
 *                       image:
 *                         type: string
 *                       authorId:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *                       updatedAt:
 *                         type: string
 *                         format: date-time
 *                       author:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           name:
 *                             type: string
 *                           email:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                 pagination:
 *                   type: object
 *                   properties:
 *                     page:
 *                       type: integer
 *                     limit:
 *                       type: integer
 *                     total:
 *                       type: integer
 *                     totalPages:
 *                       type: integer
 *                     hasNextPage:
 *                       type: boolean
 *                     hasPrevPage:
 *                       type: boolean
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /posts - Get all posts with pagination
router.get('/', async (request: Request, response: Response) => {
  try {
    const page = Math.max(1, parseInt(request.query.page as string) || 1);
    const limit = Math.max(1, Math.min(100, parseInt(request.query.limit as string) || 10));
    const skip = (page - 1) * limit;

    const [posts, total] = await Promise.all([
      prisma.post.findMany({
        skip,
        take: limit,
        include: {
          author: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.post.count()
    ]);

    const totalPages = Math.ceil(total / limit);

    response.status(200).json({
      data: posts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    response.status(500).json({ error: 'Internal server error' });
  }
});

/**
 * @swagger
 * /posts/{id}:
 *   get:
 *     summary: Get a single post by ID
 *     tags:
 *       - Posts
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post details with author information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 title:
 *                   type: string
 *                 body:
 *                   type: string
 *                 image:
 *                   type: string
 *                 authorId:
 *                   type: string
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *                 author:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: string
 *                     name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     createdAt:
 *                       type: string
 *                       format: date-time
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
// GET /posts/:id - Get single post by id
router.get('/:id', async (request: Request, response: Response) => {
  try {
    const { id } = request.params;
    const post = await prisma.post.findUnique({
      where: { id: id as string },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
      }
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

/**
 * @swagger
 * /posts:
 *   post:
 *     summary: Create a new post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - body
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               body:
 *                 type: string
 *                 description: Post content
 *               image:
 *                 type: string
 *                 description: Post image URL (optional)
 *     responses:
 *       201:
 *         description: Post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       400:
 *         description: Missing required fields
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
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

/**
 * @swagger
 * /posts/{id}:
 *   put:
 *     summary: Update a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *                 description: Post title
 *               body:
 *                 type: string
 *                 description: Post content
 *               image:
 *                 type: string
 *                 description: Post image URL
 *     responses:
 *       200:
 *         description: Post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 post:
 *                   $ref: '#/components/schemas/Post'
 *       403:
 *         description: Unauthorized - only author can update this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
      },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true
          }
        }
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

/**
 * @swagger
 * /posts/{id}:
 *   delete:
 *     summary: Delete a post
 *     tags:
 *       - Posts
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Post ID
 *     responses:
 *       200:
 *         description: Post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       403:
 *         description: Unauthorized - only author can delete this post
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Post not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
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
