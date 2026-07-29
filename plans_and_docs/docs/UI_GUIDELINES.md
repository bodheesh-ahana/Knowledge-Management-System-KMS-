# UI Design Guidelines & Component Library

**Version:** 1.0  
**Status:** Final  
**Last Updated:** 2026-07-27  

---

## Design System Overview

**Framework:** Tailwind CSS + shadcn/ui + Radix UI  
**Breakpoints:** Mobile (320px), Tablet (768px), Desktop (1024px), Wide (1280px+)  
**Color Scheme:** Light Mode & Dark Mode  
**Typography:** Inter font family  

---

## Color Palette

### Primary Colors (Brand)
```
Primary Blue
Light:    #2563eb (blue-600)
Dark:     #1e40af (blue-800)
Background: #0f172a (slate-950)

Accent
Success:  #16a34a (green-600)
Warning:  #d97706 (amber-600)
Danger:   #dc2626 (red-600)
Info:     #0ea5e9 (cyan-500)
```

### Neutral Colors
```
Light Mode
Background:    #ffffff (white)
Surface:       #f8fafc (slate-50)
Border:        #e2e8f0 (slate-200)
Text Primary:  #0f172a (slate-950)
Text Secondary: #64748b (slate-500)

Dark Mode
Background:    #0f172a (slate-950)
Surface:       #1e293b (slate-800)
Border:        #334155 (slate-700)
Text Primary:  #f1f5f9 (slate-100)
Text Secondary: #cbd5e1 (slate-400)
```

---

## Typography

### Font Family
- Primary: Inter (sans-serif)
- Monospace: JetBrains Mono (code)

### Font Sizes
```
xs:   12px  (0.75rem)
sm:   14px  (0.875rem)
base: 16px  (1rem)
lg:   18px  (1.125rem)
xl:   20px  (1.25rem)
2xl:  24px  (1.5rem)
3xl:  30px  (1.875rem)
4xl:  36px  (2.25rem)
```

### Font Weights
```
Light:    300
Regular:  400
Medium:   500
Semibold: 600
Bold:     700
```

### Line Heights
```
Tight:    1.25
Normal:   1.5
Relaxed:  1.625
Loose:    2
```

---

## Spacing System

```
2px   (0.125rem)
4px   (0.25rem)
8px   (0.5rem)
12px  (0.75rem)
16px  (1rem)
24px  (1.5rem)
32px  (2rem)
48px  (3rem)
64px  (4rem)
80px  (5rem)
96px  (6rem)
```

**Usage:**
- Padding: 16px (default), 24px (sections), 12px (compact)
- Margin: 16px (between sections), 8px (between items)
- Gap: 12px (flex/grid items), 16px (larger items)

---

## Shared Components

### 1. Button

**Variants:**
```
Primary (filled)   - Main action
Secondary (outline) - Alternative action
Ghost (text only)  - Tertiary action
Destructive (red)  - Delete/danger
Link (underline)   - Navigation
```

**Sizes:**
```
sm   - 32px height
md   - 40px height (default)
lg   - 48px height
```

**States:**
```
Default
Hover (darker shade)
Active (pressed)
Disabled (50% opacity)
Loading (spinner)
```

**Example:**
```tsx
<Button variant="primary" size="md">
  Create Article
</Button>
```

---

### 2. Card

Structure:
```
┌─────────────────────┐
│ Header (optional)   │
├─────────────────────┤
│                     │
│ Content             │
│                     │
├─────────────────────┤
│ Footer (optional)   │
└─────────────────────┘
```

**Properties:**
- Padding: 24px
- Border: 1px solid (light mode: slate-200, dark mode: slate-700)
- Border Radius: 8px
- Shadow: Light (light mode), None (dark mode)
- Hover: Slight shadow increase

**Example:**
```tsx
<Card>
  <CardHeader>Title</CardHeader>
  <CardContent>Content</CardContent>
  <CardFooter>Actions</CardFooter>
</Card>
```

---

### 3. Input

**Types:**
```
Text
Email
Password
Number
Date
Textarea
Select
Checkbox
Radio
Toggle
```

**States:**
```
Default
Focus (blue border, ring)
Disabled (gray, no cursor)
Error (red border, error message)
Success (green border)
```

**Properties:**
- Height: 40px
- Border Radius: 6px
- Padding: 12px
- Font: 16px (prevent zoom on iOS)

**Example:**
```tsx
<Input
  type="email"
  placeholder="Enter email"
  error="Invalid email"
/>
```

---

### 4. Table

**Structure:**
```
┌─────────────────────────────────────┐
│ Column 1 | Column 2 | Column 3 | ... │ ← Header (bold)
├─────────────────────────────────────┤
│ Data     | Data     | Data     | ... │
├─────────────────────────────────────┤
│ Data     | Data     | Data     | ... │
└─────────────────────────────────────┘
```

**Features:**
- Sorting (click header)
- Pagination (bottom)
- Bulk selection (checkbox column)
- Hover state (row highlight)
- Striped rows (optional)
- Responsive (horizontal scroll on mobile)

**Example:**
```tsx
<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Title</TableHead>
      <TableHead>Owner</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    {items.map(item => (
      <TableRow key={item.id}>
        <TableCell>{item.title}</TableCell>
        <TableCell>{item.owner}</TableCell>
        <TableCell>{item.status}</TableCell>
      </TableRow>
    ))}
  </TableBody>
</Table>
```

---

### 5. Badge

Small labeled element.

**Variants:**
```
Primary (blue)
Secondary (gray)
Success (green)
Warning (amber)
Danger (red)
```

**Sizes:**
```
sm - 20px height
md - 24px height
```

**Example:**
```tsx
<Badge variant="success">Published</Badge>
<Badge variant="warning">Draft</Badge>
```

---

### 6. Dialog/Modal

Overlay with content.

**Properties:**
- Backdrop: 40% opacity, click outside closes
- Width: 90% mobile, 500px desktop
- Border Radius: 8px
- Padding: 24px
- Z-index: 50

**Example:**
```tsx
<Dialog open={isOpen} onOpenChange={setIsOpen}>
  <DialogContent>
    <DialogHeader>Title</DialogHeader>
    <DialogBody>Content</DialogBody>
    <DialogFooter>Actions</DialogFooter>
  </DialogContent>
</Dialog>
```

---

### 7. Toast/Alert

Short notification.

**Variants:**
```
Success (green) - Action completed
Warning (amber) - Warning message
Error (red)     - Error occurred
Info (blue)     - Information
```

**Position:** Bottom-right (desktop), Bottom-center (mobile)  
**Auto-dismiss:** 5 seconds  

**Example:**
```tsx
useToast().success('Article created successfully');
```

---

### 8. Dropdown Menu

List of actions.

**Trigger:**
- Button with chevron icon
- Click/hover to show

**Items:**
- Clickable text
- Icons + labels
- Dividers
- Disabled items

**Example:**
```tsx
<DropdownMenu>
  <DropdownTrigger>Actions</DropdownTrigger>
  <DropdownContent>
    <DropdownItem>Edit</DropdownItem>
    <DropdownItem>Duplicate</DropdownItem>
    <DropdownDivider />
    <DropdownItem variant="danger">Delete</DropdownItem>
  </DropdownContent>
</DropdownMenu>
```

---

### 9. Sidebar Navigation

Vertical menu.

**Structure:**
```
┌─────────────────┐
│ Logo            │
├─────────────────┤
│ • Dashboard     │ ← Active (highlight)
│ • Knowledge Base│
│ • Tickets       │
│ • Tracker       │
│ • Applications  │
│ • Search        │
├─────────────────┤
│ • Profile       │
│ • Settings      │
│ • Logout        │
└─────────────────┘
```

**Width:** 240px (desktop), 0px (mobile - toggle)  
**Collapsible:** Yes (hamburger menu on mobile)  

---

### 10. Search Box

Search interface.

**Features:**
- Placeholder text
- Clear button (X icon)
- Search icon
- Debounce (300ms)
- Dropdown results
- Recent searches

**Example:**
```tsx
<SearchBox
  placeholder="Search articles..."
  onSearch={handleSearch}
  suggestions={recentSearches}
/>
```

---

## Layout Components

### Page Layout

```
┌─────────────────────────────────────┐
│ Header (dark bg, sticky)            │
├──────────────┬──────────────────────┤
│ Sidebar      │                      │
│              │ Main Content         │
│ Navigation   │                      │
│              │                      │
└──────────────┴──────────────────────┘
```

### Content Layout

**Max Width:** 1280px (centered)  
**Padding:** 24px sides (desktop), 16px sides (mobile)  

### Grid System

```
12-column grid on desktop
6-column grid on tablet
1-column grid on mobile
Gap: 16px
```

---

## Dark Mode

### Implementation

```typescript
// Using Tailwind dark mode
// Apply with data-theme attribute on <html>

<html data-theme="dark">
  {/* Dark mode classes: dark:text-white */}
</html>
```

### Color Switching

```typescript
// hooks/useDarkMode.ts
const [isDark, setIsDark] = useState(false);

const toggleDarkMode = () => {
  setIsDark(!isDark);
  document.documentElement.setAttribute(
    'data-theme',
    isDark ? 'light' : 'dark'
  );
  localStorage.setItem('theme', isDark ? 'light' : 'dark');
};
```

---

## Animations & Transitions

### Duration
```
Fast:   150ms
Normal: 300ms
Slow:   500ms
```

### Common Animations
```
Fade in/out
Slide up/down
Scale (expand/shrink)
Rotate
Height collapse
```

**Example:**
```tsx
<motion.div
  initial={{ opacity: 0 }}
  animate={{ opacity: 1 }}
  transition={{ duration: 0.3 }}
>
  Content
</motion.div>
```

---

## Responsive Design

### Mobile First Approach

```scss
// Mobile (default)
.card {
  padding: 16px;
  font-size: 14px;
}

// Tablet and up
@media (min-width: 768px) {
  .card {
    padding: 24px;
    font-size: 16px;
  }
}

// Desktop and up
@media (min-width: 1024px) {
  .card {
    padding: 32px;
    font-size: 18px;
  }
}
```

### Tailwind Breakpoints

```
sm: 640px
md: 768px
lg: 1024px
xl: 1280px
2xl: 1536px
```

---

## Accessibility

### Keyboard Navigation
- Tab: Move forward
- Shift+Tab: Move backward
- Enter: Activate button
- Escape: Close modal/dropdown
- Arrow Keys: Navigate lists

### Focus Management
```
Focus ring: 2px solid blue
Focus visible on keyboard (not mouse)
Tab index managed for custom components
```

### Color Contrast
- Text on background: 4.5:1 ratio (AA standard)
- Graphics: 3:1 ratio
- Large text: 3:1 ratio

### Screen Readers
```
alt text on images
aria-label on icons
aria-describedby on inputs
role="button" on clickable divs
```

---

## Icon System

**Library:** Lucide React (or Heroicons)

**Common Icons:**
```
Dashboard      - LayoutDashboard
Search         - Search
Plus           - Plus
Edit           - Edit2
Delete         - Trash2
Close          - X
Menu           - Menu
Settings       - Settings
User           - User
LogOut         - LogOut
ChevronDown    - ChevronDown
Info           - Info
Warning        - AlertCircle
Error          - AlertTriangle
Success        - CheckCircle
```

**Size:** 20px (default), 24px (large), 16px (small)

---

## Loading States

### Skeleton Loader

```tsx
<Card>
  <Skeleton height="20px" width="50%" />
  <Skeleton height="16px" width="80%" className="mt-2" />
</Card>
```

### Spinner

```tsx
<Spinner size="md" />
```

---

## Empty States

Show when no data available:

```
┌─────────────────────┐
│                     │
│  No results found   │
│                     │
│  [Create Button]    │
│                     │
└─────────────────────┘
```

---

## Form Validation

**Real-time validation with feedback:**

```
✓ Valid input (green border)
✗ Invalid input (red border + error message)
○ Untouched (gray border)
⊘ Disabled (gray, no cursor)
```

**Example:**
```tsx
<div>
  <Input
    value={email}
    onChange={handleChange}
    status={errors.email ? 'error' : 'success'}
  />
  {errors.email && (
    <span className="text-red-600 text-sm">
      {errors.email}
    </span>
  )}
</div>
```

---

## File Organization

```
src/components/
├── shared/
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Table.tsx
│   ├── Badge.tsx
│   ├── Dialog.tsx
│   ├── Toast.tsx
│   ├── Dropdown.tsx
│   ├── Sidebar.tsx
│   ├── Header.tsx
│   ├── SearchBox.tsx
│   └── CommandPalette.tsx
├── dashboard/
├── knowledge/
├── tickets/
├── tracker/
├── applications/
├── profile/
└── settings/
```

---

**Document Status:** ✅ Ready for Development
