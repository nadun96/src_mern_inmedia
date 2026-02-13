import express from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();
const prisma = new PrismaClient();

/**
 * @swagger
 * /users/profile/{userId}:
 *   get:
 *     summary: Get user profile with followers/following counts
 *     tags:
 *       - Users
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The user ID
 *     responses:
 *       200:
 *         description: User profile successfully retrieved
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 followers:
 *                   type: array
 *                   items:
 *                     type: string
 *                 following:
 *                   type: array
 *                   items:
 *                     type: string
 *                 isFollowing:
 *                   type: boolean
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to fetch user profile
 */
router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        followers: {
          select: {
            followerId: true,
          },
        },
        following: {
          select: {
            followingId: true,
          },
        },
      },
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if current user follows this user
    const isFollowing = currentUserId
      ? user.followers.some((f) => f.followerId === currentUserId)
      : false;

    res.json({
      ...user,
      followers: user.followers.map((f) => f.followerId),
      following: user.following.map((f) => f.followingId),
      isFollowing,
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

/**
 * @swagger
 * /users/{userId}/follow:
 *   post:
 *     summary: Follow a user
 *     tags:
 *       - Users
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: The ID of the user to follow
 *     responses:
 *       200:
 *         description: Successfully followed user
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *       400:
 *         description: Cannot follow yourself or already following
 *       401:
 *         description: Not authenticated
 *       404:
 *         description: User not found
 *       500:
 *         description: Failed to follow user
 */
router.post('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (currentUserId === userId) {
      return res.status(400).json({ error: 'Cannot follow yourself' });
    }

    // Check if user exists
    const userExists = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!userExists) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Check if already following
    const existingFollow = await prisma.follow.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    if (existingFollow) {
      return res.status(400).json({ error: 'Already following this user' });
    }

    // Create follow
    await prisma.follow.create({
      data: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    res.json({ message: 'Successfully followed user' });
  } catch (error) {
    console.error('Error following user:', error);
    res.status(500).json({ error: 'Failed to follow user' });
  }
});

/**
 * @route DELETE /users/:userId/follow
 * @desc Unfollow a user
 * @access Private
 */
router.delete('/:userId/follow', authenticateToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const currentUserId = req.user?.userId;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Delete follow
    const result = await prisma.follow.deleteMany({
      where: {
        followerId: currentUserId,
        followingId: userId,
      },
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Not following this user' });
    }

    res.json({ message: 'Successfully unfollowed user' });
  } catch (error) {
    console.error('Error unfollowing user:', error);
    res.status(500).json({ error: 'Failed to unfollow user' });
  }
});

/**
 * @route GET /users/:userId/followers
 * @desc Get list of followers for a user
 * @access Public
 */
router.get('/:userId/followers', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const followers = await prisma.follow.findMany({
      where: { followingId: userId },
      select: {
        follower: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.follow.count({
      where: { followingId: userId },
    });

    res.json({
      data: followers.map((f) => f.follower),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

/**
 * @route GET /users/:userId/following
 * @desc Get list of users that a user is following
 * @access Public
 */
router.get('/:userId/following', async (req, res) => {
  try {
    const { userId } = req.params;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    const following = await prisma.follow.findMany({
      where: { followerId: userId },
      select: {
        following: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      skip,
      take: limit,
    });

    const total = await prisma.follow.count({
      where: { followerId: userId },
    });

    res.json({
      data: following.map((f) => f.following),
      total,
      page,
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

/**
 * @route GET /users/suggestions
 * @desc Get suggested users to follow
 * @access Private
 */
router.get('/suggestions/recommended', authenticateToken, async (req, res) => {
  try {
    const currentUserId = req.user?.userId;
    const limit = parseInt(req.query.limit as string) || 5;

    if (!currentUserId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    // Get users the current user is following
    const following = await prisma.follow.findMany({
      where: { followerId: currentUserId },
      select: { followingId: true },
    });

    const followingIds = following.map((f) => f.followingId);

    // Get suggested users (users not followed, excluding self)
    const suggestions = await prisma.user.findMany({
      where: {
        id: {
          notIn: [...followingIds, currentUserId],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        followers: {
          select: {
            followerId: true,
          },
        },
      },
      take: limit,
    });

    res.json({
      data: suggestions.map((user) => ({
        ...user,
        followerCount: user.followers.length,
        followers: user.followers.map((f) => f.followerId),
      })),
    });
  } catch (error) {
    console.error('Error fetching suggestions:', error);
    res.status(500).json({ error: 'Failed to fetch suggestions' });
  }
});

export default router;
