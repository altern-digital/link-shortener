import { Router } from "express";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const router = Router();

router.get("/:alias", async (req, res) => {
  var link = await prisma.link.findUnique({
    where: {
      alias: req.params.alias,
    },
  });

  if (link) {
    await prisma.record.create({
      data: {
        link: {
          connect: {
            id: link.id,
          },
        },
      },
    });

    res.redirect(link.originalLink);
  } else {
    res.status(404).send("Not found");
  }
});

export default router;
