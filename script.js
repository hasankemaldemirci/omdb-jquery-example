class Movie {
  constructor (data) {
    this.title = data.Title;
    this.poster = data.Poster;
    this.rate = data.imdbRating
  }
}

function search(query) {
	return $.ajax ({
    url: "http://www.omdbapi.com/?apikey=63f944af",
    method: "get",
    data: {"s": query},
  });
}

function getMovie(id) {
	return $.ajax ({
    url: "http://www.omdbapi.com/?apikey=63f944af",
    method: "get",
    data: {"i": id},
  });
}

function setLastSearch(term) {
  let lastSearches = JSON.parse(localStorage.getItem('last_searches') || "[]");
  lastSearches.push(term);
  let uniqueSearches = [...new Set(lastSearches)]
  if (uniqueSearches.length <= 11) {
    localStorage.setItem('last_searches', JSON.stringify(uniqueSearches));
    $('#last-search-body').empty();
    uniqueSearches.filter(s => {
      if (s) {
        $('.last-search').show()
        $("#last-search-body").append(`
          <div class="last-search-item">${s}<em onClick="removeLastSearchItem()">x</em></div>
        `)
      } else {
        $('.last-search').hide()
      }
    })  
  }
}

function removeLastSearchItem() {
  event.preventDefault();
  let searches = JSON.parse(localStorage.getItem('last_searches'));
  searches.filter((s, i) => {
    if (s === event.target.previousSibling.data) {
      searches.splice(i, 1)
      localStorage.setItem('last_searches', JSON.stringify(searches));
      setLastSearch('')
    }
  })
}

$(function() {
  setLastSearch('');
  
	$("#search-form-btn").on("click", function(event) {
    event.preventDefault();
    let searchTerm = $("#search-form-input").val();
    setLastSearch(searchTerm)
    if (searchTerm) {
      $('#movie-detail-body').html('<img src="img/loader.gif" class="loader" />');
      let movies = []
      search(searchTerm).then(data => {
        let search = data.Search;
        
        if (search) {
          for (i = 0; i < search.length; i++) {
            getMovie(search[i].imdbID).then(m => {
              movies.push(new Movie(m))

              if (search.length === movies.length) {
                $('#movie-detail-body').empty();
                movies.filter(m => {
                  $("#movie-detail-body").append(`
                    <div class="col">
                      <div class="movie-card">
                        <figure class="movie-card__poster">
                          <img src="${m.poster && m.poster !== 'N/A' ? m.poster : 'img/placeholder-img.jpg'}" width="300" height="350" alt="${m.title}" />
                        </figure>
                        <figcaption class="movie-card__description">
                          <div class="title">${m.title}</div>
                          <div class="rate">
                            <span class="progress" style="width:${m.rate && m.rate !== 'N/A' ? m.rate * 10 : 0 * 10}%">
                              <em style="display:${m.rate && m.rate !== 'N/A' ? 'block' : 'none'}">Rating: ${m.rate}</em>
                            </span>
                          </div>
                        </figcaption>
                      </div>
                    </div>
                  `)
                })
              }
            })
          }
        } else {
          $('#movie-detail-body').html('<h1 style="text-align:center">Sonuç Bulunamadı!</h1>');
        }
      })
    } else {
      alert('Lütfen film adı alanını boş bırakmayınız.')
    }
  });
});