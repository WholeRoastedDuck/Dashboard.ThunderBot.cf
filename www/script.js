         if(getDark() == "true"){
           document.querySelector(":root").classList.add('dark');
           }
       function dark () {
         if(getDark() == "false"){
           document.querySelector(":root").classList.add('dark');
             localStorage.setItem("dark","true");
           }else{
             document.querySelector(":root").classList.remove('dark');
             localStorage.setItem("dark","false");
             }
       }
       function getDark () {
         return localStorage.getItem("dark") || "false";
       }

       
      document.querySelectorAll('.checkbox').forEach(element => {
        element.onclick = (event) => {
          event.preventDefault();
          if (element.classList.contains('checked')) {
            element.classList.remove('checked');
          } else {
            element.classList.add('checked');
          }
        }
      });