// dodać: lepszy podział na strony, div "loading" z jakimś kręcącym się znaczkiem


$(document).ready(function() {

  // deklaracja podstawowych elementów
  var $articles = $('section.articles'), // miejsce w lewej szpalcie na listę artykułów
    $article = $('section.showArticle'); // miejsce w prawej szpalcie na pełną treść artykułu

  // zapisuję adres api
  var url = 'http://jsonplaceholder.typicode.com/comments';

  // pobieram cookie o nazwie 'id'
  var myCookie = getCookie('id');
  console.log('my Cookie: ' + myCookie);

// ========== LISTA ARTYKUŁÓW ============================================================

  $.ajax({ // pobieram listę artykułów, żeby wyświetlić je w lewej szpalcie
    url: url,
    type: 'GET'
  }).done(function(response){

    var articlesPerPage = 21, // określam, ile artykułów ma być na jednej stronie listy
      totalPages = Math.ceil(response.length / articlesPerPage), // obliczam, ile stron będzie w sumie
      pageCounter = 1, // deklaruję zmienną określającą początkowy numer strony
      articleCounter = 1; // deklaruję zmienną określającą index artykułu na stronie
    console.log(response.length + ' artykułów, ' + totalPages + ' stron, ' + articlesPerPage + ' art/str');

    $.each(response, function(i,item) {

      var page = item.postId,
        id = item.id,
        title = item.name,
        email = item.email;

      // tworzę pozycję z danym artykułem
      var $newArticle = $('<article>');
      var $newH3 = $('<h3>');
      $newH3.text(title);
      var $newP = $('<p class="author">');
      $newP.text(email);
      $newArticle.append($newH3).append($newP);
      $newArticle.data('id', id).data('page', page);

      if (!isNaN(myCookie) && !(myCookie.length == 0) && (id == myCookie)) { // jeśli cookie nie jest puste, później wyświetli się ostatnio oglądany artykuł, więc na liście nadaję mu klasę 'active'
        $newArticle.addClass('active');
      }

      // dodaję dany artykuł do odpowiedniej strony
      var pageId = 'page' + page; // zapisuję w zmiennej id strony, pageX
      // jeśli trafiłam na kolejny postId, tworzę nową stronę do paginacji (nowego diva)
      if (page == pageCounter) {
        // tworzę stronę z artykułami
        var $newArticlesPage = $('<div class="articles">'); // tworzę nową stronę z artykułami
        $newArticlesPage.attr('id', pageId); // ustawiam id z numerem strony, pageX
        $newArticlesPage.insertBefore($articles.children().last()); // dodaję do drzewa DOM przed paginacją
        if (page > 1) { // ukrywam kolejne strony
          // $('#page' + (page)).css('display', 'none');
          $('#page' + (page)).hide();
        }
        // tworzę paginację
        var $newPaginationElement = $('<li>'); // tworzę nowy element do paginacji
        $newPaginationElement.text(page).data('page', page); // dodaję numer strony jako tekst oraz data-page
        var $pagination = $('ol.pagination'); // znajduję paginację
        $newPaginationElement.appendTo($pagination); // dodaję element do paginacji
        if (page == 1) { // oznaczam aktywną stronę w paginacji poprzez klasę active
          $newPaginationElement.addClass('active');
        }
        if (page > 5) { // ukrywam zbędne numery stron ;p
          $newPaginationElement.css('display', 'none');
        }
        // na koniec zwiększam licznik, aby znów czyhać na kolejny postId ;)
        pageCounter++;
      }

      pageId = '#' + pageId; // dodaję #, żeby odwołać się do id elementu
      var $articlesPage = $(pageId); // znajduję odpowiednią stronę (tj. div'a)
      $newArticle.appendTo($articlesPage); // dodaję do tej strony mój nowy artykuł

    });
  }).fail(function(error){
    console.log(error);
  });

// przewijanie listy artykułów




// ========== SPRAWDZENIE COOKIE ============================================================

  if (!isNaN(myCookie) && !(myCookie.length == 0)) { // jeśli cookie nie jest puste, wyświetlam ostatnio oglądany artykuł

    $.ajax({ // pobieram dane przez ajax'a
      url: url,
      type: 'GET'
    }).done(function(response){

      var id = '', // deklaruję zmienne z danymi artykułu
        title = '',
        email = '',
        content = '';

      $.each(response, function(i,item) { // pobieram dane dla konkretnego artykułu (id zapisane w ciasteczku)
        if (i==(myCookie-1)) { // index liczy się od 0, więc index = id -1
          id = item.id;
          title = item.name;
          email = item.email;
          content = item.body;
        }
      });

      // dodaję artykuł w odpowiednim miejscu na stronie
      showArticle(id, title, email, content);

    }).fail(function(error){
      console.log(error);
    });
  } // koniec if'a


// ========== WYŚWIETLENIE ARTYKUŁU ============================================================

  // po kliknięciu w artykuł na liście w lewej szpalcie, pokazuję całą jego treść
  $articles.on('click', 'article', function() {
    $article.empty(); // usuwamy poprzedni artykuł

    $articles.find('.active').removeClass('active'); // usuwamy oznaczenie z artykułu, który się teraz wyświetla (jeśli taki jest)
    $(this).addClass('active');

    var $thisArt = $(this), // pobieram dane, które już mam (z klikniętego artykułu)
      id = $thisArt.data('id'),
      title = $thisArt.find('h3').text(),
      email = $thisArt.find('p').text();
    var content = ''; // deklaruję zmienną na brakującą wartość (treść)

    $.ajax({ // pobieram przez ajaxa brakującą wartość
      url: url,
      type: 'GET'
    }).done(function(response){

      $.each(response, function(i,item) { // pobieram wartość dla konkretnego artykułu
        if (i==id-1) {
          content = item.body;
        }
      });

      // dodaję i wyświetlam artykuł
      showArticle(id, title, email, content);

      // COOKIES
      document.cookie = "id=; expires=Thu, 01 Jan 1970 00:00:00 UTC"; // usuwam istniejące ciasteczko 'id'
      setCookie('id', id, 1); // ustawiam nowe casteczko z zapisanym id wyświetlanego artykułu

    }).fail(function(error){
      console.log(error);
    });

  }); // koniec event listenera na click w artykuł z listy


// ========== FUNKCJE ============================================================

  function showArticle(id, title, email, content) {
    var $newArticle = $('<div class="theArticle">');
    var $newH1 = $('<h1>');
    $newH1.text(title);
    var $newP = $('<p class="author">');
    $newP.text(email);
    var $newContent = $('<p class="content">');
    $newContent.html(content + '. ' + content + '. ' + content + '<br>' + content + '. ' + content + '. ' + lorem + '. ' + content + '<br>' + content + '. ' + lorem + '. ' + content); // dodaję kilka razy plus lorem ipsum, żeby bardziej przypominało artykuł ;p
    $newArticle.append($newH1).append($newP).append($newContent);
    $article.append($newArticle);
    $newArticle.data('id', id);
  }
  function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
  }
  function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i <ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0)==' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length,c.length);
        }
    }
    return "";
  }

  var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.';

});
