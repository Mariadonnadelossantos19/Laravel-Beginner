<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Control structures</title>
</head>
<body>
    <header>
        <h1>Employee Information</h1>
    </header>
    
    <main>
        @if($grade == 75)
            <p>good!</p>
        @elseif($grade > 75)
            <p>good job!</p>
        @else
            <p>keep trying!</p>
        @endif
    </main>
    <footer>
        <p>&copy; 2023 Company Name. All rights reserved.</p>
    </footer>
</body>
</html>