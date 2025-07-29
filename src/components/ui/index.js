// UI Components Index
// All UI components converted from React/TypeScript to JavaScript HTML generators

const { Badge } = require('./badge');
const { Button } = require('./button');
const { Card } = require('./card');
const { Dialog } = require('./dialog');
const { Form } = require('./form');
const { Input } = require('./input');
const { Label } = require('./label');
const { Progress } = require('./progress');
const { Select } = require('./select');
const { Sheet } = require('./sheet');
const { Tabs } = require('./tabs');
const { Textarea } = require('./textarea');

module.exports = {
  Badge,
  Button,
  Card,
  Dialog,
  Form,
  Input,
  Label,
  Progress,
  Select,
  Sheet,
  Tabs,
  Textarea
};

// Usage examples:
/*

// Basic usage
const { Button, Card, Input } = require('./ui');

// Create a button
const buttonHtml = Button.create({
  text: 'Click me',
  variant: 'primary',
  onclick: 'handleClick()'
});

// Create a card
const cardHtml = Card.create({
  header: Card.createHeader({ title: 'My Card' }),
  content: 'Card content here',
  footer: Card.createFooter({ content: 'Card footer' })
});

// Create an input
const inputHtml = Input.create({
  type: 'text',
  name: 'username',
  placeholder: 'Enter username',
  required: true
});

// Create a form with validation
const formHtml = Form.createCompleteField({
  label: 'Email',
  control: Input.create({
    type: 'email',
    name: 'email',
    placeholder: 'Enter email'
  }),
  description: 'We will never share your email',
  required: true
});

// Create tabs
const tabsHtml = Tabs.createComplete({
  tabs: [
    { value: 'tab1', label: 'Tab 1', content: 'Content 1' },
    { value: 'tab2', label: 'Tab 2', content: 'Content 2' }
  ],
  defaultValue: 'tab1'
});

// Create a dialog
const dialogHtml = Dialog.createComplete({
  title: 'Confirm Action',
  description: 'Are you sure you want to continue?',
  actions: [
    { text: 'Cancel', variant: 'outline' },
    { text: 'Confirm', variant: 'destructive' }
  ]
});

*/
