import { Request, Response, Router } from "express";
import { Link, PrismaClient, User } from "@prisma/client";
import { randomUUID } from "crypto";

const prisma = new PrismaClient();
const router = Router();

// Middleware to get or generate a userId and set it in a cookie
const getUserId = (req: Request, res: Response) => {
  let userId = randomUUID();
  if (req.cookies && req.cookies.userId) {
    userId = req.cookies.userId;
  }
  res.cookie("userId", userId);
  return userId;
};

// Get a link by alias
const getLinkByAlias = async (alias: string) => {
  return prisma.link.findUnique({
    where: {
      alias: alias,
    },
  });
};

// Get a user by userId or create a new user
const getUserByUserId = async (userId: string) => {
  let user = await prisma.user.findUnique({
    where: {
      userId: userId,
    },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        userId: userId,
      },
    });
  }
  return user;
};

// Create a new record
const createRecord = async (link: Link, user: User) => {
  return prisma.record.create({
    data: {
      link: {
        connect: {
          id: link.id,
        },
      },
      user: {
        connect: {
          id: user.id,
        },
      },
    },
  });
};

router.get("/:alias", async (req, res) => {
  const userId = getUserId(req, res);
  const link = await getLinkByAlias(req.params.alias);

  if (link) {
    const user = await getUserByUserId(userId);
    const record = await createRecord(link, user);

    res.redirect(link.originalLink);
  } else {
    res.status(404).send("Not found");
  }
});

router.get("/:alias/stats", async (req, res) => {
  var alias = req.params.alias;

  const link = await prisma.link.findUnique({
    where: {
      alias: alias,
    },
    include: {
      records: true,
    },
  });

  if (link) {
    res.json(link);
  } else {
    res.status(404).send("Not found");
  }
});

export default router;
