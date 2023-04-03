$(document).ready(function () {

  let url = "https://newsapi.org/v2/everything?q=tokyo + travel&from=2022-09-13&language=en&sortBy=publishedAt&apiKey=9f4137fa701842b3a1d0ca31302f8436";
  
    $.ajax({
      url: url,
      method: "GET",
      dataType: "JSON",
  
      beforeSend: function () {
        $(".progress").show();
      },
  
      complete: function () {
        $(".progress").hide();
      },
  
      success: function (newsdata) {
        let output = "";
        let news = newsdata.articles;
        let card_column = '<div class="card-columns">';
        for (var i in news) {
          output += `
          
          
          
            
             
              <div class="card">
                <img src="${news[i].urlToImage}" class="card-img-top" alt="${news[i].title}">
                <div class="card-body">
                  <h5 class="card-title">Title:<a href="${news[i].url}" title="${news[i].title}">${news[i].title}</a></h5>
                  <p class="card-text"><b>Author</b>: ${news[i].author}</p>
                  <p class="card-text"><b>News source</b>: ${news[i].source.name}</p>
                  <p class="card-text"><b>Published</b>: ${news[i].publishedAt}</p>
                  <a href="${news[i].url}" class="btn btn-primary">Read More</a>
                  </div>
                </div>
              
            
          
            
          `;
          
        }
        output = card_column + output;
  
        if (output !== "") {
          $("#newsReturn").html(output);
        }
  
      },
  
      error: function () {
        let errorMessage = `<div class="errorMsg center">Error occured</div>`;
        $("#newsReturn").html(errorMessage);
      }
    })
  
  });