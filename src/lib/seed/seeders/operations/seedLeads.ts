import { validLeadInteractionsType, validLeadSources } from "@/lib/enumsTypes";
import { generateNameAndEmail, generatePhone, generateTimestamps } from "@/lib/seed/utils/helpers";
import { logError, logInfo, logSuccess } from "@/lib/seed/utils/logger";
import { leadsCodeGenerator } from "@/lib/utils";
import { faker } from "@faker-js/faker";
import { connectDB } from "@/lib/seed/utils/connect";
import { Document, ObjectId, WithId } from "mongodb";
import { seedRootAdmin } from "@/lib/seed/seeders/seedRoot";
import { seedSalesAgents } from "@/lib/seed/seeders/users/seedSalesAgents";
import { deviceDistribution, interactionOutcomes, leadLabelValues, leadNotes, reminderTitles } from "@/lib/seed/data/utils";

export const seedLeads = async (
  stages: Awaited<ReturnType<typeof seedRootAdmin>>["leadStages"],
  agents: Awaited<ReturnType<typeof seedSalesAgents>>["agents"],
) => {
  logInfo("Seeding Leads...");

  const { db, client } = await connectDB();
  const leadCollection = db.collection("Lead");
  const leadInteractionCollection = db.collection("LeadInteraction");
  const leadLabelCollection = db.collection("LeadLabel");
  const leadNoteCollection = db.collection("LeadNote");
  const userCollection = db.collection("User");

  const leadsToInsert: WithId<Document>[] = []
  const leadInteracionsToInsert: WithId<Document>[] = []
  const leadLabelsToInsert: WithId<Document>[] = []
  const leadNotesToInsert: WithId<Document>[] = []
  const usersToInsert: WithId<Document>[] = []

  const labelIds = leadLabelValues.map((value) => {
    const labelId = new ObjectId()

    leadLabelsToInsert.push({
      _id: labelId,
      value,
      leadIds: [],
      ...generateTimestamps()
    })

    return labelId
  })

  const noteIds = leadNotes.map((value) => {
    const noteId = new ObjectId()

    leadNotesToInsert.push({
      _id: noteId,
      value,
      leadIds: [],
      ...generateTimestamps()
    })

    return noteId
  })

  faker.helpers.multiple(() => {
    const leadId = new ObjectId()
    const { name, email } = generateNameAndEmail()
    const stage = faker.helpers.weightedArrayElement(stages.map(s => ({
      value: s,
      weight: s.defaultStage === "Converted" ? 75
        : s.defaultStage === "Qualified" ? 7.5
          : s.defaultStage === "Intake" ? 7.5
            : s.defaultStage === "Lost" ? 5
              : s.defaultStage === "NotQualified" ? 5 : 0
    })))
    const leadStageId = stage._id

    const agent = stage.name === "Intake" ? faker.helpers.weightedArrayElement([
      {
        value: faker.helpers.arrayElement([...agents, null]),
        weight: 70
      },
      {
        value: null,
        weight: 30
      },
    ]) : faker.helpers.arrayElement([...agents])
    const assigneeId = agent?.salesAgentId
    const userId = stage.name === "Converted" ? new ObjectId() : null
    const timestamps = generateTimestamps()

    const interactionIds = faker.helpers.multiple(() => {
      const interactionId = new ObjectId()
      const interactionType = faker.helpers.arrayElement(validLeadInteractionsType);
      const description = faker.helpers.arrayElement(interactionOutcomes);

      leadInteracionsToInsert.push({
        _id: interactionId,
        type: interactionType,
        description,
        leadId,
        salesAgentId: assigneeId,
        ...generateTimestamps(timestamps.updatedAt)
      })

      return interactionId
    }, { count: { min: 1, max: 5 } })

    const reminders = !assigneeId ? [] : faker.helpers.multiple(() => ({
      title: faker.helpers.arrayElement(reminderTitles),
      time: faker.date.soon({ refDate: timestamps.updatedAt }),
    }), { count: { min: 0, max: 3 } })

    if (userId) {
      usersToInsert.push({
        _id: userId,
        email,
        name,
        phone: generatePhone(),
        device: faker.helpers.weightedArrayElement(deviceDistribution),
        userRoles: ["Student"],
        leadIds: [leadId],
        address: {
          city: faker.location.city(),
          country: faker.location.country(),
          state: faker.location.state(),
          street: faker.location.streetAddress()
        },
        emailVerified: timestamps.updatedAt,
        image: faker.image.avatar(),
        ...timestamps
      })
    }

    leadsToInsert.push({
      _id: leadId,
      name,
      email,
      phone: generatePhone(),
      code: leadsCodeGenerator(timestamps.createdAt),
      isAssigned: !!assigneeId,
      isAutomated: true,
      isReminderSet: false,
      source: faker.helpers.arrayElement(validLeadSources),
      leadStageId,
      assigneeId,
      userId,
      interactionIds,
      reminders,
      labelIds: faker.helpers.arrayElements(labelIds),
      noteIds: faker.helpers.arrayElements(noteIds),
      ...timestamps
    });
  }, { count: { min: 800, max: 1200 } })

  const session = client.startSession();
  try {
    await session.withTransaction(async () => {
      await leadCollection.insertMany(leadsToInsert, { session });
      await leadInteractionCollection.insertMany(leadInteracionsToInsert, { session });
      await leadLabelCollection.insertMany(leadLabelsToInsert, { session });
      await leadNoteCollection.insertMany(leadNotesToInsert, { session });
      await userCollection.insertMany(usersToInsert, { session });
    });

    logSuccess(`Inserted ${leadsToInsert.length} Leads`);
    logSuccess(`Inserted ${leadInteracionsToInsert.length} Lead Interactions`);
    logSuccess(`Inserted ${leadLabelsToInsert.length} Lead Labels`);
    logSuccess(`Inserted ${leadNotesToInsert.length} Lead Notes`);
    logSuccess(`Inserted ${usersToInsert.length} Users`);

  } catch (error) {
    logError(`Error during seeding Leads: ${error}`);
  } finally {
    await session.endSession();
  }

  const convertedStageId = stages.find(ls => ls.name === "Converted")?._id

  return {
    leads: leadsToInsert,
    convertedLeads: leadsToInsert.filter(l => l.leadStageId === convertedStageId),
    leadInteracions: leadInteracionsToInsert,
    leadLabels: leadLabelsToInsert,
    leadNotes: leadNotesToInsert,
    convertedStageId,
  };
};
