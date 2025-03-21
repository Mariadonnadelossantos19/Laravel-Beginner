<!DOCTYPE html>
   <html lang="en">
   <head>
       <meta charset="UTF-8">
       <meta name="viewport" content="width=device-width, initial-scale=1.0">
       <title>User Profile</title>
       <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/bootstrap/5.3.0/css/bootstrap.min.css">
   </head>
   <body>
       <div class="container mt-5">
           <h2>User Profile</h2>
           <p><strong>Name:</strong> {{ $user->name }}</p>
           <p><strong>Email:</strong> {{ $user->email }}</p>
           <form action="{{ route('logout') }}" method="POST">
               @csrf
               <button type="submit" class="btn btn-danger">Logout</button>
           </form>
       </div>
   </body>
   </html>