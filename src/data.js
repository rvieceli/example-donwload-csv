import { faker } from "@faker-js/faker";

export async function* getData({ size, throttle }) {
  for (let i = 0; i < size; i++) {
    if (throttle) {
      await new Promise((resolve) => setTimeout(resolve, throttle));
    }

    yield {
      id: faker.string.uuid(),
      name: faker.person.fullName(),
      email: faker.internet.email(),
      phone: faker.phone.number(),
      country: faker.location.country(),
      city: faker.location.city(),
      zipCode: faker.location.zipCode(),
      streetAddress: faker.location.streetAddress(),
    };
  }
}
