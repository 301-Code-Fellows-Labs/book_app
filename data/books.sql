DROP TABLE IF EXISTS books;
CREATE TABLE books (
  id SERIAL PRIMARY KEY,
  author VARCHAR(255),
  title VARCHAR(255),
  image_url TEXT,
  isbn VARCHAR(255),
  description TEXT,
  bookshelf VARCHAR(255)
);



INSERT INTO books (author, title, image_url, isbn, description, bookshelf)  VALUES('J.K. Rowling',
'Harry Potter and the Sorcerers Stone',
'http://books.google.com/books/content?id=wrOQLV6xB-wC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
'ISBN_13 9781781100486',
'Turning the envelope over, his hand trembling, Harry saw a purple wax seal bearing a coat of arms; a lion, an eagle, 
a badger and a snake surrounding a large letter H. Harry Potter has never even heard of Hogwarts when the letters
start dropping on the doormat at number four, Privet Drive. Addressed in green ink on yellowish parchment with a purple seal,
they are swiftly confiscated by his grisly aunt and uncle. Then, on Harrys eleventh birthday,
a great beetle-eyed giant of a man called Rubeus Hagrid bursts in with some astonishing news:
Harry Potter is a wizard, and he has a place at Hogwarts School of Witchcraft and Wizardry. 
An incredible adventure is about to begin! Pottermore has now launched the Wizarding World Book Club.
Visit Pottermore to sign up and join weekly Twitter discussions at WW Book Club.',
'Favorits');


INSERT INTO books (author, title, image_url, isbn, description, bookshelf) VALUES ('J. R. R. Tolkien',
'The Hobbit',
'http://books.google.com/books/content?id=U799AY3yfqcC&printsec=frontcover&img=1&zoom=5&edge=curl&source=gbs_api',
'ISBN_13 9780007322602',
'Read the definitive edition of Bilbo Baggins adventures in middle-earth in this 
classic bestseller behind this year’s biggest movie.',
'Classic');

