const { dbService } = require('../src/lib/services');
const { getMockDb } = require('../src/lib/mockDb');

try {
  console.log("Checking getMockDb...");
  const db = getMockDb();
  console.log("Database keys:", Object.keys(db));
  console.log("Projects length:", db.projects.length);
  
  console.log("Checking dbService.getProjects...");
  dbService.getProjects('all').then(projects => {
    console.log("Successfully fetched projects:", projects.length);
  }).catch(err => {
    console.error("dbService.getProjects threw error:", err);
  });
} catch(err) {
  console.error("Sync test threw error:", err);
}
