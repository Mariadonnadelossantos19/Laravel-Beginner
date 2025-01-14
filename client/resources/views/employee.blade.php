<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Employee</title>
</head>
<body>
    <header>
        <h1>Employee Information</h1>
    </header>
    
    <main>
   
        <section id="employee-details">
        <p>Name: {{$employee ['name']}}</p>
        <p>Age: {{$employee ['age']}}</p>
        <p>Department: {{$employee ['department']}}</p>
        </section>
    </main>
    <footer>
        <p>&copy; 2023 Company Name. All rights reserved.</p>
    </footer>
</body>
</html>