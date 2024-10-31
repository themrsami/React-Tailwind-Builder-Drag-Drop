# React-Tailwind-Builder-Drag-Drop

A drag-and-drop web builder that enables users to design layouts with React and TailwindCSS. Currently under development, this app allows you to create nested components, apply styles to multiple nodes at once, and export the layout as React code. You can check the live version [here](https://tailwindreactbuilder.vercel.app/).

## Table of Contents

- [React-Tailwind-Builder-Drag-Drop](#react-tailwind-builder-drag-drop)
  - [Table of Contents](#table-of-contents)
  - [Features](#features)
  - [Installation](#installation)
  - [Usage Guide](#usage-guide)
    - [Selecting Nodes](#selecting-nodes)
    - [Adding Nested Nodes](#adding-nested-nodes)
    - [Multi-Node Selection and Styling](#multi-node-selection-and-styling)
    - [Modifying Layout and Color](#modifying-layout-and-color)
    - [Exporting Component Code](#exporting-component-code)
    - [Renaming Components](#renaming-components)
  - [Contributing](#contributing)
  - [License](#license)

## Features

- **Drag-and-Drop Layouts**
- **Nested Components**
- **Multi-Node Styling**
- **Live Preview with TailwindCSS**
- **React Code Export**

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/themrsami/React-Tailwind-Builder-Drag-Drop.git
   ```
2. Navigate to the project directory:
   ```bash
   cd React-Tailwind-Builder-Drag-Drop
   ```
3. Install dependencies:
   ```bash
   pnpm install
   ```

## Usage Guide

### Selecting Nodes
1. Open the application in development mode by running:
   ```bash
   pnpm dev
   ```
   or you can also use

   ```bash
   pnpm dev --turbo
   ```
2. Navigate to `http://localhost:3000` in your browser.
3. Use the **Node Tree tab** to select a specific node or child component. Each node represents a distinct part of your layout that you can style individually.

### Adding Nested Nodes
1. After selecting a node, add nested child nodes within it by using the options available in the Node Tree tab.
2. You can nest multiple layers, allowing you to create complex layouts with ease.

### Multi-Node Selection and Styling
1. To style multiple components at once, use **multi-select** by holding down the modifier key (usually `Ctrl` or `Cmd`).
2. Apply any class or styling option, and it will instantly affect all selected nodes, making it easier to ensure a uniform design.

### Modifying Layout and Color
1. After selecting the nodes, click on **Layout** or **Color** tabs.
2. These tabs offer various styling and layout options like padding, margin, color, etc., allowing you to customize each component visually.

### Exporting Component Code
1. Once your design is complete, go to the **Code** tab to view the generated React component code.
2. Simply copy the code and paste it into your project for seamless integration.

### Renaming Components
1. At the top of the workspace page, there’s an input field where you can rename your component.
2. Enter any name, which will update the component’s title in the export.

## Contributing

This project is still in development, and we welcome contributions! To contribute:

1. **Fork** the repository.
2. **Create a branch** for your feature or bug fix:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes** and commit with clear, descriptive messages.
4. **Push to your branch**:
   ```bash
   git push origin feature/your-feature-name
   ```
5. Open a **pull request** on the main repository.

Please ensure your code follows the style and conventions of the project.

## License

This project is licensed under the MIT License.