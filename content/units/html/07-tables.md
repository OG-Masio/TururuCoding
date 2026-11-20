---
title: Tables
minutes: 20
---

When data has rows and columns, like a count sheet, a price list or a schedule, it belongs in a table.

## Answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Cycle count</title>
  </head>
  <body>
    <h1>Cycle count: aisle 12</h1>

    <table>
      <caption>Counted on Monday, first shift</caption>
      <thead>
        <tr>
          <th>Item</th>
          <th>System</th>
          <th>Counted</th>
          <th>Difference</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cola 12-pack</td>
          <td>120</td>
          <td>118</td>
          <td>-2</td>
        </tr>
        <tr>
          <td>Water 24-pack</td>
          <td>80</td>
          <td>80</td>
          <td>0</td>
        </tr>
        <tr>
          <td>Orange juice 6-pack</td>
          <td>45</td>
          <td>47</td>
          <td>+2</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
```

## Starter

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Cycle count</title>
  </head>
  <body>

  </body>
</html>
```

## Explanation

A table is written **row by row**. You never write a column. A column appears because every row has a cell in the same position.

- `<table>` The whole table.
- `<caption>` A short title for the table. It is optional, but it tells the reader what they are looking at.
- `<thead>` The part of the table with the column titles.
- `<tbody>` The part of the table with the data.
- `<tr>` A **table row**. Everything between `<tr>` and `</tr>` is on one line of the table.
- `<th>` A **header cell**: the title of a column. The browser shows it in bold.
- `<td>` A **data cell**: one value.

The one rule to remember: **every row needs the same number of cells.** This table has four columns, so every `tr` has four cells. If one row has three, its values slide into the wrong columns.

The table has no lines yet. Browsers draw tables without borders. Lines, colors and spacing are added with CSS in unit 2.

## Twist

1. Add a fourth data row for another item, with its system quantity, counted quantity and difference.
2. Add a fifth column called `Counted by`. That means one more cell in **every** row: a `th` in the header row and a `td` with a name in each data row.

## Checks

- The table has four data rows :: document.querySelectorAll('tbody tr').length >= 4
- The header row has five column titles :: document.querySelectorAll('thead th').length === 5
- Every row has five cells :: (() => { const rows = [...document.querySelectorAll('tr')]; return rows.length > 0 && rows.every((r) => r.children.length === 5); })()

## Twist answer

```html file=index.html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Cycle count</title>
  </head>
  <body>
    <h1>Cycle count: aisle 12</h1>

    <table>
      <caption>Counted on Monday, first shift</caption>
      <thead>
        <tr>
          <th>Item</th>
          <th>System</th>
          <th>Counted</th>
          <th>Difference</th>
          <th>Counted by</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Cola 12-pack</td>
          <td>120</td>
          <td>118</td>
          <td>-2</td>
          <td>Sam</td>
        </tr>
        <tr>
          <td>Water 24-pack</td>
          <td>80</td>
          <td>80</td>
          <td>0</td>
          <td>Sam</td>
        </tr>
        <tr>
          <td>Orange juice 6-pack</td>
          <td>45</td>
          <td>47</td>
          <td>+2</td>
          <td>Lee</td>
        </tr>
        <tr>
          <td>Iced tea 12-pack</td>
          <td>60</td>
          <td>57</td>
          <td>-3</td>
          <td>Lee</td>
        </tr>
      </tbody>
    </table>
  </body>
</html>
```

## What changed

- `<th>Counted by</th>` The new column starts in the header row, as the last cell.
- `<td>Sam</td>` Then every data row gets one more `td` at the end. Five cells in every row, so the column lines up.
- `<tr>` … `</tr>` The new item is a whole new row inside `tbody`, with five cells like the others.
