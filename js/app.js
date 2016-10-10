$(document).ready(function() {

// deklaracja podstawowych zmiennych
  var url = 'http://jsonplaceholder.typicode.com/comments', // adres api
    n = 8, // liczba artykułów per strona na liście
    artArray = [], // tablica z wszystkimi artykułami pobranymi z serwera
    $articles = $('section.articles'), // miejsce w lewej szpalcie na listę artykułów
    $article = $('section.showArticle'), // miejsce w prawej szpalcie na pełną treść artykułu
    $pagination = $('ol.pagination'), // paginacja
    currentPageNo = 0; // zmienna przechowująca numer aktualnie wyświetlanej strony w lewej szpalcie

// sprawdzenie cookie
  var myCookie = getCookie('id'); // pobieram cookie
  var cookiePresent = (!isNaN(myCookie) && !(myCookie.length == 0)) ? true : false; // zapisuję zmienną, czy mam poprawne dane z cookie

// ========== POBIERANIE DANYCH ============================================================

  $.ajax({ // pobieram listę artykułów, żeby wyświetlić je w lewej szpalcie
    url: url,
    type: 'GET'
  }).done(function(response){
    artArray = response; // zapisuję pobrane dane do tablicy
    displayArticles(); // aktualizuję zawartość strony
  }).fail(function(error){
    ajaxFailed();
    console.log(error);
  });
  function displayArticles() { // reszta kodu wewnątrz funkcji odpalanej po poprawnym pobraniu danych z serwera

// ========== LISTA ARTYKUŁÓW ============================================================

  // tworzę strony z listami artykułów do wyświetlenia w lewej szpalcie
    var totalPages = Math.ceil(artArray.length / n); // obliczam łączną liczbę stron (liczba artykułów przez liczbę artykułów per strona zaokrąglone w górę)
    for (var pageNo = 1; pageNo <= totalPages; pageNo++) { // dla każdej strony:

      var $newPage = $('<div class="articles">'); // tworzę nowy element div = strona
      $newPage.data('page',pageNo); // ustawiam atrybut data-page z numerem strony
      var artArrForNewPage = artArray.splice(0,n); // wycinam z tablicy pobranej z serwera artykuły do wyświetlenia na aktualnej stronie

      // dodaję do strony artykuły
      $.each(artArrForNewPage, function(artNo,article) { // dla każdego artykułu z aktualnej strony:
        var $newArticle = $('<article>'); // tworzę element article
        $newArticle // zapisuję dane artykułu w data-set
          .data('page', pageNo)
          .data('id', article.id)
          .data('title', article.name)
          .data('author', article.email)
          .data('content', article.body)
          .attr('id', ('art' + article.id));
        var $newTitle = $('<h3>' + $newArticle.data('title') + '</h3>'), // tworzę tytuł h3
          $newAuthor = $('<p class="author">' + $newArticle.data('author') + '</p>'); // tworzę paragraf z autorem
        $newArticle.append($newTitle).append($newAuthor); // dodaję elementy do artykułu
        $newArticle.appendTo($newPage); // a artykuł dodaję do strony
      });

      $newPage.insertBefore($articles.children().last()); // stronę dodaję do drzewa DOM (przed paginacją)
      $newPage.hide(); // domyślnie każdą stronę ukrywam

      // dodaję paginację
      var $newPaginationElement = $('<li>' + pageNo + '</li>'); // tworzę nowy element do paginacji
      $newPaginationElement
        .data('page', pageNo) // dodaję numer strony jako data-page
        .insertBefore($pagination.children().last()); // dodaję element do drzewa DOM (przed przyciskiem 'next')
        // .hide(); // domyślnie każdy element paginacji ukrywam
    }

    //odkrywam stronę, która ma się wyświetlać na początku
    if (!cookiePresent) { // jeśli nie ma cookie
      $('#loading').hide();
      $articles.children().eq(1).show();
      $pagination.children().eq(1).addClass('active');
      $pagination.css('margin-top', $articles.children().eq(1).height() + 15);
      currentPageNo = 1;
    } else { // jeśli jest cookie
      var $lastArticle = $('#art' + myCookie),
        lastArtPageNo = $lastArticle.data('page'),
        $lastArticlePage = $articles.children().eq(lastArtPageNo);
      $('#loading').hide();
      $lastArticlePage.show();
      $pagination.children().eq(lastArtPageNo).addClass('active');
      $pagination.css('margin-top', $lastArticlePage.height() + 15);
      currentPageNo = lastArtPageNo;
    }
    var $currentPage = $articles.children().eq(currentPageNo);


// ========== WYŚWIETLENIE ARTYKUŁU Z COOKIE ============================================================

    if (cookiePresent) { // jeśli jest cookie
      showArticle(myCookie); // wyświetlam artykuł o odpowiednim id
    }

// ========== WYŚWIETLANIE ARTYKUŁU PO KLIKNIĘCIU ============================================================

    $articles.on('click', 'article', function() {
      var artId = $(this).data('id');
      showArticle(artId);
    });

// ========== OBSŁUGA PAGINACJI ============================================================

    $pagination.on('click', 'li', function() {
      var clickIndex = $(this).html();
      if ($.isNumeric(clickIndex)) { // jeśli kliknięto w przycisk konkretnej strony
        updatePagination(currentPageNo, clickIndex);
        currentPageNo = clickIndex;
      } else if (clickIndex == '&lt;') { // jeśli kliknięto przycisk prev
        clickIndex = parseInt(currentPageNo) - 1;
        if (clickIndex > 0) {
          updatePagination(currentPageNo, clickIndex);
          currentPageNo = clickIndex;
        }
      } else if (clickIndex == '&gt;') { // jeśli kliknięto przycisk next
        clickIndex = parseInt(currentPageNo) + 1;
        if (clickIndex < totalPages) {
          updatePagination(currentPageNo, clickIndex);
          currentPageNo = clickIndex;
        }
      }
    });

  } // KONIEC FUNKCJI displayArticles() do aktualizacji treści na stronie

// ========== FUNKCJE ============================================================

  // wyświetlenie artykułu
  function showArticle(id) {
    $article.empty(); // usuwamy poprzedni artykuł

    // pokazywanie pełnej treści artykułu na stronie
    var $clickedArticle = $('#art' + id),
      $newArticle = $('<div class="theArticle">'),
      $newTitle = $('<h1>' + $clickedArticle.data('title') + '</h1>'),
      $newAuthor = $('<p class="author">' + $clickedArticle.data('author') + '</p>'),
      $newContent = $('<p class="content">' + extendContent($clickedArticle.data('content')) + '</p>');
    $newArticle.append($newTitle).append($newAuthor).append($newContent);
    $article.append($newArticle);

    // aktualizacja wyróżnienia na liście artykułów
    $articles.find('article.active').removeClass('active');
    $clickedArticle.addClass('active');

    // aktualizacja cookie
    setCookie('id', id, 1);
  }

  // aktualizacja paginacji
  function updatePagination(currentPageNo, clickIndex) {
    $pagination.children().eq(currentPageNo).removeClass('active');
    $pagination.children().eq(clickIndex).addClass('active');
    var $currentPage = $articles.children().eq(currentPageNo),
      $pageToShow = $articles.children().eq(clickIndex);
    if (clickIndex < currentPageNo) {
      $currentPage.hide('slide', {direction: 'right'}, 1000);
      $pageToShow.show('slide', {direction: 'left'}, 1000);
    } else if (currentPageNo < clickIndex) {
      $currentPage.hide('slide', {direction: 'left'}, 1000);
      $pageToShow.show('slide', {direction: 'right'}, 1000);
    }
    $pagination.animate({'margin-top': $pageToShow.height() + 15}, 1000);
  }

// tworzenie cookie
  function setCookie(cname, cvalue, exdays) {
      var d = new Date();
      d.setTime(d.getTime() + (exdays*24*60*60*1000));
      var expires = "expires="+ d.toUTCString();
      document.cookie = cname + "=" + cvalue + "; " + expires;
  }

// pobieranie cookie
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

// usuwanie cookie
  function deleteCookie(cname) {
    setCookie(cname, '', -1); // aby usunąć cookie, ustawiamy jego datę ważności na wczoraj
    alert('cookies deleted');
  }
  // event listener na elemencie na stronie
  $('#deleteCookies').on('click', function() {
    deleteCookie('id');
  });

// nieudane pobieranie danych z serwera
  function ajaxFailed() {
    alert('Brak danych.');
  }

// powielanie contentu, żeby wyglądało bardziej jak artykuł
  function extendContent(txt) {
    var lorem = 'Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum. ';
    return txt + '. ' + txt + '. ' + txt + '. ' + '<br>' + txt + '. ' + lorem + lorem + txt + '. ' + '<br>' + txt + '. ' + lorem + txt + '. ';
  };

});
