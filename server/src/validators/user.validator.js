import Joi from 'joi';

const socialLinkSchema = Joi.string().uri().allow('', null);
const dateSchema = Joi.date().allow(null);
const textArraySchema = Joi.array().items(Joi.string().trim().max(80)).max(30);

const workingDaySchema = Joi.object({
  enabled: Joi.boolean(),
  start: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(''),
  end: Joi.string().pattern(/^\d{2}:\d{2}$/).allow(''),
});

const updateUserSchema = Joi.object({
  name: Joi.string().min(2).max(100),
  avatar: Joi.string().uri().allow('', null),
  profile: Joi.object({
    personal: Joi.object({
      firstName: Joi.string().trim().max(80).allow(''),
      lastName: Joi.string().trim().max(80).allow(''),
      phoneNumber: Joi.string().trim().max(30).allow(''),
      personalEmail: Joi.string().email().allow(''),
      dateOfBirth: dateSchema,
      gender: Joi.string().trim().max(40).allow(''),
      maritalStatus: Joi.string().trim().max(40).allow(''),
      about: Joi.string().trim().max(1200).allow(''),
      tags: textArraySchema,
      address: Joi.object({
        streetAddress: Joi.string().trim().max(200).allow(''),
        city: Joi.string().trim().max(80).allow(''),
        state: Joi.string().trim().max(80).allow(''),
        zipCode: Joi.string().trim().max(30).allow(''),
        country: Joi.string().trim().max(80).allow(''),
      }),
      guardian: Joi.object({
        name: Joi.string().trim().max(120).allow(''),
        relationship: Joi.string().trim().max(80).allow(''),
        contactNumber: Joi.string().trim().max(30).allow(''),
      }),
    }),
    professional: Joi.object({
      jobTitle: Joi.string().trim().max(120).allow(''),
      department: Joi.string().trim().max(120).allow(''),
      yearsOfExperience: Joi.alternatives(
        Joi.number().min(0).max(80),
        Joi.string().trim().max(20).allow(''),
      ),
      workLocation: Joi.string().trim().max(120).allow(''),
      skills: textArraySchema,
      certifications: Joi.array().items(Joi.string().trim().max(120)).max(30),
    }),
    schedule: Joi.object({
      timeZone: Joi.string().trim().max(80).allow(''),
      workingHours: Joi.object({
        monday: workingDaySchema,
        tuesday: workingDaySchema,
        wednesday: workingDaySchema,
        thursday: workingDaySchema,
        friday: workingDaySchema,
        saturday: workingDaySchema,
        sunday: workingDaySchema,
      }),
    }),
    education: Joi.object({
      degree: Joi.string().trim().max(150).allow(''),
      fieldOfStudy: Joi.string().trim().max(150).allow(''),
      institution: Joi.string().trim().max(180).allow(''),
      startDate: dateSchema,
      endDate: dateSchema,
      description: Joi.string().trim().max(1200).allow(''),
    }),
    social: Joi.object({
      github: socialLinkSchema,
      linkedin: socialLinkSchema,
      website: socialLinkSchema,
      x: socialLinkSchema,
    }),
    account: Joi.object({
      status: Joi.string().valid('online', 'offline', 'away', 'busy'),
      secondaryEmail: Joi.string().email().allow(''),
    }),
  }),
}).min(1);

export { updateUserSchema };
