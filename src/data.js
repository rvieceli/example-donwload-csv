import { faker } from "@faker-js/faker";
import { randomUUID } from "node:crypto";

export function* getData(size) {
  for (let i = 0; i < size / 1000; i++) {
    yield Array.from({ length: 1000 }).map((_) => ({
      id: randomUUID(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      country: faker.location.country(),
      city: faker.location.city(),
      zipCode: faker.location.zipCode(),
      streetAddress: faker.location.streetAddress(),
    }));
  }

  return size;
}
