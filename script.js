// Script

// Livro
function Book(title, image, sinopse, link_site){
    this.title = title;
    this.image = image;
    this.sinopse = sinopse;
    this.link_site = link_site;
    this.likes = 0;
    this.dislikes = 0;

    // funcao para incrementar likes
    this.like = function(){
        this.likes ++;
    } 

    // funcao para incrementar dislikes
    this.dislike = function() {
        this.dislikes ++;
    }

    // funcao para colocar livros no ficheiro html (no fundo serve para mostrar no ecra)
    this.write = function(num_display){

        $("#title" + num_display).html( this.title );                    // Escreve titulo
        $("#img" + num_display).attr("src", this.image );                // Escreve imagem
        $("#sinopse" + num_display).html( this.sinopse );                // Escreve sinopse
        $("#site_oficial" + num_display).attr( "href", this.link_site ); // altera o link de site
        $(".like" + num_display).html( this.likes );                    // altera numero de likes
        $(".dis_like" + num_display).html( this.dislikes );             // altera numero de dislikes

        // Variavel com informacao necessaria para os cliques
        var data = {"book":this, "id_display":num_display};

        // botao de like
        $("#bt" + num_display + "_g").off('click');        // retira o click para se adicionar outra vez
        $("#bt" + num_display + "_g").click(data, function(event){

            // Contagem de likes
            event.data.book.like();

            // faz stack
            bookshelf.putStack( event.data.book );

            // faz dequeue
            bookshelf.get( event.data.id_display -1 );

            // mudar livro
            bookshelf.switch_books( event.data.id_display );

        });

        // botao de nao like
        $("#bt" + num_display + "_ng").off('click');        // retira o click para se adicionar outra vez
        $("#bt" + num_display + "_ng").click(data, function(event){

            // Contagem de deslikes
            event.data.book.dislike();

            // faz dequeue
            bookshelf.get( event.data.id_display -1 );

            // mudar livro           
            bookshelf.switch_books( event.data.id_display );
        });

        // botao de next
        $("#bt" + num_display + "_next").off('click');        // retira o click para se adicionar outra vez
        $("#bt" + num_display + "_next").click(data, function(event){

            // retira da stack
            bookshelf.getStack(  event.data.id_display -1 );

            // mudar livro
            bookshelf.switch_booksStack( event.data.id_display );
        });
    };
};

// fila
function Queue(){

    // dados
    this.data = [];

    // funcao para mostrar dados
    this.show = function(index){
        return this.data[index];
    }

    // adicionar elementos (Enqueue)
    this.enQueue = function(element){
        this.data.push(element);
    }

    // retirar elementos (Dequeue)
    this.deQueue = function(index){
        this.data.splice(index,1);
    }
}

// pilha de livros
function Stack(){

    // dados
    this.data = [];

    // funcao para mostrar dados
    this.show = function(index){
        return this.data[  this.data.length -1 - index];
    }

    // coloca dados
    this.stack = function(element){
        this.data.push(element);
    }

    // funcao para mostrar os livros de que se gostou
    this.getStack = function(index){
        this.data[this.data.length -1 - index] ? this.data.splice( this.data.length -1 - index , 1) : this.data.splice(0, 0);
    }
}

// prateleira
function Bookshelf(){

    // local para guardar os livros em fila
    this.books = new Queue();
    this.booksStack = new Stack();

    // funcao de receber da API da google
    this.search = function(string, index){
        var aux = this;
        $.get('https://www.googleapis.com/books/v1/volumes?q=' + string + '&printType=books&maxResults=10&startIndex=' + index)
            .done(function(data){
                data.totalItems != 0 ? aux.put(data) : aux.put(emptyData);
                SearchIndexConstant += data.items.length;
            })
            .fail(function(data){
                console.log("ERROR: " + data);
                aux.put(emptyData);
        });
        this.loading();
    }

    // funcao de colocar livros na prateleira (enqueue)
    this.put = function(data){

        //ciracao dos livros para os colocar na fila à espera de aparecerem no ecra
        for (var i = 0; i < data.items.length; i++) {
            var book = new Book(
                '',
                '',
                '',
                ''
            );

            // caso os livros nao tenham alguma das informacoes necessarias como titulo ou imagem é colocado por default algo a dizer que tal informacao nao foi recebida/nao existe
            data.items[i].volumeInfo.title ? book.title = data.items[i].volumeInfo.title : book.title = 'There is no title available';
            data.items[i].volumeInfo.imageLinks ? book.image = data.items[i].volumeInfo.imageLinks.thumbnail : book.image = 'http://www.stevegiasson.com/public/media/images/oeuvres_images/image/there_is_no_image_available_72dpi.jpg';
            data.items[i].volumeInfo.description ? book.sinopse = data.items[i].volumeInfo.description : book.sinopse = 'There is no description available';
            data.items[i].accessInfo.webReaderLink ? book.link_site = data.items[i].accessInfo.webReaderLink : book.link_site = '';

            // Colocar os livros na fila à espera de aparecerem no ecra
            this.books.enQueue(book);
        }

        this.show(0).write(1);
        this.show(1) ? this.show(1).write(2) : emptyBook.write(2);
        this.show(2) ? this.show(2).write(3) : emptyBook.write(3);
    };

    // funcao para colocar livros que se gosta na pilha
    this.putStack = function(book){
        this.booksStack.stack(book);
    }

    // funcao para retirar livros da prateleira
    this.get = function(index){
        this.books.deQueue(index);
    }

    this.getStack = function(index){
        this.booksStack.getStack(index);
    }

    // funcao para mostrar livros da prateleira / fila
    this.show = function(index){
        return this.books.show(index);
    }

    // funcao para mostrar livros da stack pilha
    this.showStack = function(index){
        return this.booksStack.show(index);
    }

    // funcao para trocar livros no html da prateleira
    this.switch_books = function(num_display){

        // Animacao de saida do livro presente
        if (num_display == 1) {
            $("#div1").addClass('animated rotateOutDownLeft');
            $("#div2").addClass('animated slideOutLeft');
            $("#div3").addClass('animated slideOutLeft');
        } else if (num_display == 2) {
            $("#div2").addClass('animated rotateOutDownLeft');
            $("#div3").addClass('animated slideOutLeft');
        } else if (num_display == 3) {
            $("#div3").addClass('animated rotateOutDownLeft');
        }

        var bookshelf = this; // variavel criada porque nao da para aceder a objectos na funcao de setTimeout

        // Delay entre saida e entrada entre livros
        setTimeout(function(){ 

            // mostra livros novamente ou um livro vazio
            bookshelf.show(0) ? bookshelf.show(0).write(1) : bookshelf.search( $("#search_input").val(), SearchIndexConstant);
            bookshelf.show(1) ? bookshelf.show(1).write(2) : bookshelf.search( $("#search_input").val(), SearchIndexConstant);
            bookshelf.show(2) ? bookshelf.show(2).write(3) : bookshelf.search( $("#search_input").val(), SearchIndexConstant);

            // Remocao de animacao 
            $("#div1").removeClass('animated slideOutLeft rotateOutDownLeft');
            $("#div2").removeClass('animated slideOutLeft rotateOutDownLeft');
            $("#div3").removeClass('animated slideOutLeft rotateOutDownLeft');
        },1000);
    };

    // funcao para mostrar livros da pilha que se gostou
    this.switch_booksStack = function(num_display){

        // Animacao de saida do livro presente
        if (num_display == 1) {
            $("#div1").addClass('animated rotateOutDownLeft');
            $("#div2").addClass('animated slideOutLeft');
            $("#div3").addClass('animated slideOutLeft');
        } else if (num_display == 2) {
            $("#div2").addClass('animated rotateOutDownLeft');
            $("#div3").addClass('animated slideOutLeft');
        } else if (num_display == 3) {
            $("#div3").addClass('animated rotateOutDownLeft');
        }

        var bookshelf = this; // variavel criada porque nao da para aceder a objectos na funcao de setTimeout

        // Delay entre saida e entrada entre livros
        setTimeout(function(){ 

            // mostra livros da pilha ou um livro vazio
            bookshelf.showStack(0) ? bookshelf.showStack(0).write(1) : emptyBook.write(1);
            bookshelf.showStack(1) ? bookshelf.showStack(1).write(2) : emptyBook.write(2);
            bookshelf.showStack(2) ? bookshelf.showStack(2).write(3) : emptyBook.write(3);

            // Remocao de animacao
            $("#div1").removeClass('animated slideOutLeft rotateOutDownLeft');
            $("#div2").removeClass('animated slideOutLeft rotateOutDownLeft');
            $("#div3").removeClass('animated slideOutLeft rotateOutDownLeft');
        },1000);

        
    }

    // funcao para fazer "dequeue" a toda a bookshelf
    this.erase = function(){
        this.books.data = [];
    }

    //  funcao para loading screen 
    this.loading = function() {

        $("#div_principal").hide();
        $("#div_loading").show();

        var elem = document.getElementById("myBar"); 
        var width = 10;
        var id = setInterval(frame, 10);
        function frame() {
            if (width >= 100) {
                clearInterval(id);
            } else {
                width+=0.4; 
                elem.style.width = width + '%'; 
                elem.innerHTML = width.toFixed(1) * 1 + '%';
            }
        }
        setTimeout(function(){
            $("#div_principal").show();
            $("#div_loading").hide();
        },2800)
    }
};

// inicializacao -------------------------------------------------
var bookshelf = new Bookshelf();

// livro vazio
var emptyBook = new Book(
    "There are no more books!",
    'https://static.stuff.co.nz/1362990757/065/8411065.jpg',
    'Empty Synopsis...',
    '',
    '',
    ''
);

// empty data criada para ser apresentada quando a pesquisa nao retrna resultados
function Data(items){
    this.items = [items, items, items];
}

var emptyData = new Data({
        "volumeInfo":{"title":'There was no data received...',
                    "imageLinks":{"thumbnail":'http://www.stevegiasson.com/public/media/images/oeuvres_images/image/there_is_no_image_available_72dpi.jpg'},
                    "description":'Try another search...'},
        "accessInfo":{"webReaderLink":''}
                        });

// botao de search (procura)
var data = {"bookshelf":bookshelf}
var SearchIndexConstant = 0;
$("#btn_search").click(data, function(event){
    SearchIndexConstant = 0;
    var string = $("#search_input").val();
    event.data.bookshelf.erase();
    event.data.bookshelf.search( string , SearchIndexConstant);
    
    $(".btns_g_ng").show();
    $(".btn_next").hide();
});

$("#div_principal").hide();

// botao para mostrar pilha de livros de que gostou
$("#btn_stack").click(data, function(event){
    
    bookshelf.loading();
    bookshelf.showStack(0) ? bookshelf.showStack(0).write(1) : emptyBook.write(1);
    bookshelf.showStack(1) ? bookshelf.showStack(1).write(2) : emptyBook.write(2);
    bookshelf.showStack(2) ? bookshelf.showStack(2).write(3) : emptyBook.write(3);

    $(".btns_g_ng").hide();
    $(".btn_next").show();
});


// BASE DE DADOS ... -------------------------------
function Database(){

	// parametro para abrir a base de dados no metodo open()
	this.db;

	// Abre a base de dados
    this.open = function(){
        try {
            if (!window.openDatabase) {
                alert('not supported');
            } else {
                var shortName = 'database.sql';
                var version = '1.0';
                var displayName = 'DATA';
                var maxSize = 2*1024*1024; // in bytes
                this.db = openDatabase(shortName, version, displayName, maxSize);
         
            }
        } catch(e) {
            // Error handling code goes here.
            if (e == 2) {
                // Version number mismatch.
                alert("Invalid database version.");
            } else {
                alert("Unknown error "+e+".");
            }
        }
    }

    // // funçao que retorna o erro numa janela de alerta
    // this.errorHandler = function(transaction, error){
    //     // error.message is a human-readable string.
    //     // error.code is a numeric error code
    //     alert('Oops.  Error was: '+error.message+' (Code '+error.code+')');
     
    //     // Handle errors here
    //     var we_think_this_error_is_fatal = true;
    //     if (we_think_this_error_is_fatal) return true;
    //     return false;
    // }

    // funcao para apagar tabelas da base de dados
    this.erase = function(){
    	this.db.transaction( function(transaction){
    		// apaga a tabela
    		transaction.executeSql("DROP TABLE USER;");
    		transaction.executeSql("DROP TABLE BOOK;");
    		transaction.executeSql("DROP TABLE RATING;");
    	});
    }

	// Cria as tabelas necessárias
    this.create = function(){
    	this.db.transaction( function(transaction){
	    	transaction.executeSql("CREATE TABLE IF NOT EXISTS USER("+
	                                    "USER_IP     TEXT    PRIMARY KEY     NOT NULL"+
	                                ");");

	        transaction.executeSql("CREATE TABLE IF NOT EXISTS BOOK("+
	                                    "BOOK_ID     INTEGER PRIMARY KEY AUTOINCREMENT   NOT NULL,"+
	                                    "TITLE       TEXT,"+
	                                    "IMG_SRC     TEXT,"+
	                                    "DESCRIPTION TEXT,"+
	                                    "LINK        TEXT"+
	                                ");");

	        transaction.executeSql("CREATE TABLE IF NOT EXISTS RATING("+
	                                    "USER_IP 	 TEXT,"+ // para futuro uso
	                                    "BOOK_ID     INT,"+  // id do livro
	                                    "LIKES       INT,"+  // like sera sempre "1" ou "0"
	                                    "DISLIKES    INT,"+  // para futuro uso
	                                    "FOREIGN KEY(USER_IP) REFERENCES USER(USER_IP),"+
	                                    "FOREIGN KEY(BOOK_ID) REFERENCES BOOK(BOOK_ID)"+
	                                ");");
	    });
    }

    // inserir utilizador
	this.insertUser = function(user_ip){
		this.db.transaction( function(transaction){
    		transaction.executeSql("INSERT INTO USER( USER_IP )"+
                                	"VALUES('" + user_ip + "');");
    	});
	}

	// inserir livro
    this.insertBook = function( TITLE, IMG_SRC, DESCRIPTION, LINK){
    	this.db.transaction( function(transaction){
    		transaction.executeSql("INSERT INTO BOOK( TITLE, IMG_SRC, DESCRIPTION, LINK)"+
                                	"VALUES('"+ TITLE +"', '"+ IMG_SRC + "', '"+ DESCRIPTION + "', '"+ LINK + "');");
    	});
	}

	// inserir rating
	this.insertRating = function( USER_IP, BOOK_ID, LIKES, DISLIKES ){
		this.db.transaction( function(transaction){
    		transaction.executeSql("INSERT INTO RATING( USER_IP, BOOK_ID, LIKES, DISLIKES )"+
                                	"VALUES('"+ USER_IP +"', '"+ BOOK_ID + "', '"+ LIKES + "', '"+ DISLIKES + "');");
    	});
	}
}

var database = new Database();

database.erase();