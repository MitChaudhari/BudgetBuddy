# BudgetBuddy Final Project - ITMD 442

## Mitansh Chaudhari

- **Email**: mchaudhari1@hawk.iit.edu
- **Course**: ITMD 442, Final Project
- **Git repository URL**: [https://github.com/ITMD442-MitC/BudgetBuddy](https://github.com/ITMD442-MitC/BudgetBuddy)

## Project Description

BudgetBuddy is a  web-based personal finance management tool designed to help users effectively track and manage their expenses and budgets. The application features an intuitive dashboard that allows users to view transactions, set budget limits, and analyze their spending habits through interactive charts. By providing real-time insights into financial activities, BudgetBuddy aims to empower users to make informed decisions and achieve their financial goals. The platform also includes functionalities such as secure user authentication and the ability to download detailed budget reports, enhancing both usability and accessibility.

## Development Environment

The development environment for this project includes:

- **Computer OS**: MacBook Air M1
- **Node.js Version**: v20.11.0
- **NPM Version**: 10.5.0
- **Editor**: Visual Studio Code
- Additional tools and technologies include MongoDB Atlas for the database, Express.js for the server-side logic, Bootstrap for front-end styling, and Google Docs for tasks breakdown.

## Installation/Running Instructions

To get the project up and running, follow these steps:

1. Clone the repository:
   ```
   git clone https://github.com/ITMD442-MitC/BudgetBuddy.git
   ```
2. Navigate to the project directory:
   ```
   cd BudgetBuddy
   ```
3. Make sure to get the `.env` file from the blackboard.

4. Install dependencies:
   ```
   npm install
   ```
5. Start the application in development mode:
   ```
   npm run dev
   ```
6. Access the application by navigating to [http://localhost:3000/](http://localhost:3000/) in your web browser.

7. For testing purposes and you can use the following login credentials: `username:` mit and `password:` 123456 

8. Follow the on page directions and check out the different pages. Feel free to test out with creating a new account. 

## Insights and Results
The development of BudgetBuddy provided key insights into handling data visualization and user authentication in web applications. A significant challenge was incorporating a dynamic pie chart into PDF reports, which could not be achieved due to static rendering limitations with `puppeteer`. Future improvements will explore server-side image rendering or alternative libraries to resolve this.

Additionally, plans to enhance the dashboard with features like payment due date reminders and upcoming expense alerts are in consideration to make BudgetBuddy a more proactive financial tool. These enhancements aim to address current limitations and expand the application's functionality in supporting users' financial management.

## References

Professor Bailey's lecture demos and moviedb lab provided foundational knowledge and guidance.
