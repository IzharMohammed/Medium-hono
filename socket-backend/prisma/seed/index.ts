import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    // === Chat 3: One-on-one chat between Marco and Shanks ===
    const chatMarcoShanks = await tx.chat.create({
      data: {
        name: 'Marco & Shanks',
        isGroupChat: false,
        participants: {
          connect: [{ id: 2 }, { id: 5 }],
        },
        admin: {
          connect: { id: 2 },
        },
      },
    });

    const msgMarcoShanks = await tx.chatMessage.create({
      data: {
        content: 'Yo Shanks! Ready to sail?',
        senderId: 2,
        chatId: chatMarcoShanks.id,
      },
    });

    await tx.chat.update({
      where: { id: chatMarcoShanks.id },
      data: {
        lastMessageId: msgMarcoShanks.id,
      },
    });

    // === Chat 4: One-on-one chat between Random and Shanks ===
    const chatRandomShanks = await tx.chat.create({
      data: {
        name: 'Random & Shanks',
        isGroupChat: false,
        participants: {
          connect: [{ id: 27 }, { id: 5 }],
        },
        admin: {
          connect: { id: 5 },
        },
      },
    });

    const msgRandomShanks = await tx.chatMessage.create({
      data: {
        content: 'Hey! Long time no see.',
        senderId: 5,
        chatId: chatRandomShanks.id,
      },
    });

    await tx.chat.update({
      where: { id: chatRandomShanks.id },
      data: {
        lastMessageId: msgRandomShanks.id,
      },
    });

    // === Chat 5: Group Chat - Anime Fans ===
    const animeChat = await tx.chat.create({
      data: {
        name: 'Anime Fans',
        isGroupChat: true,
        participants: {
          connect: [{ id: 2 }, { id: 5 }, { id: 27 }],
        },
        admin: {
          connect: { id: 5 },
        },
      },
    });

    const msgAnime = await tx.chatMessage.create({
      data: {
        content: 'Who’s the best swordsman in anime?',
        senderId: 27,
        chatId: animeChat.id,
      },
    });

    await tx.chat.update({
      where: { id: animeChat.id },
      data: {
        lastMessageId: msgAnime.id,
      },
    });

    // === Chat 6: Group Chat - Midnight Coders ===
    const codingChat = await tx.chat.create({
      data: {
        name: 'Midnight Coders',
        isGroupChat: true,
        participants: {
          connect: [{ id: 2 }, { id: 27 }],
        },
        admin: {
          connect: { id: 27 },
        },
      },
    });

    const msgCoding = await tx.chatMessage.create({
      data: {
        content: 'Let’s debug together at 2 AM 🤓',
        senderId: 27,
        chatId: codingChat.id,
      },
    });

    await tx.chat.update({
      where: { id: codingChat.id },
      data: {
        lastMessageId: msgCoding.id,
      },
    });
  },{
    timeout:20000,
    maxWait:20000
  });
}

main()
  .then(async () => {
    console.log('✅ Seeded with transaction successfully!');
    await prisma.$disconnect();
  })
  .catch(async (err) => {
    console.error('🔥 Seeding failed:', err);
    await prisma.$disconnect();
    process.exit(1);
  });
