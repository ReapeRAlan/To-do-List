// Demo data for testing the ToDo List App
// You can import this in the browser console to test the app with sample data

const demoTasks = [
    {
        id: "demo1",
        text: "Welcome to your ToDo List App! 🎉",
        completed: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    },
    {
        id: "demo2", 
        text: "Try adding a new task using the input above",
        completed: false,
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: "demo3",
        text: "Click the checkbox to mark this task as complete",
        completed: false,
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: "demo4",
        text: "Use the edit button to modify tasks",
        completed: false,
        createdAt: new Date(Date.now() - 10800000).toISOString(),
        updatedAt: new Date(Date.now() - 10800000).toISOString()
    },
    {
        id: "demo5",
        text: "This task is already completed ✅",
        completed: true,
        createdAt: new Date(Date.now() - 14400000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString()
    },
    {
        id: "demo6",
        text: "Try the filter buttons to view different task states",
        completed: true,
        createdAt: new Date(Date.now() - 18000000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString()
    },
    {
        id: "demo7",
        text: "All your data is saved in local storage",
        completed: false,
        createdAt: new Date(Date.now() - 21600000).toISOString(),
        updatedAt: new Date(Date.now() - 21600000).toISOString()
    },
    {
        id: "demo8",
        text: "Delete this task using the trash button",
        completed: false,
        createdAt: new Date(Date.now() - 25200000).toISOString(),
        updatedAt: new Date(Date.now() - 25200000).toISOString()
    }
];

// Function to load demo data
function loadDemoData() {
    localStorage.setItem('todoTasks', JSON.stringify(demoTasks));
    console.log('Demo data loaded! Refresh the page to see the sample tasks.');
}

// Function to clear all data
function clearAllData() {
    localStorage.removeItem('todoTasks');
    console.log('All data cleared! Refresh the page to see the empty state.');
}

// Instructions
console.log(`
🎯 ToDo List App Demo Data
========================

To load sample tasks, run:
loadDemoData()

To clear all data, run:
clearAllData()

Then refresh the page to see the changes.
`);

// Auto-load demo data if no tasks exist
if (!localStorage.getItem('todoTasks') || JSON.parse(localStorage.getItem('todoTasks')).length === 0) {
    console.log('No existing tasks found. Loading demo data...');
    loadDemoData();
}
