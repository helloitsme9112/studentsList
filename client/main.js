(() => {
  class Student {
    constructor(surname, name, lastname, birthday, faculty, studyStart, id) {
      this.surname = surname
      this.name = name
      this.lastname = lastname
      this.birthday = birthday
      this.faculty = faculty
      this.studyStart = studyStart
      this.id = id
    }

    getFIO() {
      return this.surname + ' ' + this.name + ' ' + this.lastname
    }

    getPeriod() {
      const today = new Date();

      let period = this.studyStart + '-' + (+this.studyStart + 4);
      let diff = today.getFullYear() - this.studyStart;

      //это просто срань. если читать спустя время, то вникнуть очень сложно
      //работает и слава богу
      if (diff > 3 && today.getMonth() > 8 || diff > 4) {
        period += ' (закончил)';
      } else if (diff <= 1 && today.getMonth() < 8) {
        period += ' (1 курс)';
      } else if ((diff <= 1 && today.getMonth() > 8) || (diff < 4 && today.getMonth() > 8)) {
        period += ' (' + (diff + 1) + ' курс)';
      } else if (diff <= 4 && today.getMonth() < 8) {
        period += ' (' + diff + ' курс)';
      }

      return period;
    }


    //получаем д/р строку
    getBirthday() {
      const yyyy = this.birthday.getFullYear();
      let mm = this.birthday.getMonth() + 1;
      let dd = this.birthday.getDate();

      mm < 10 ? mm = '0' + mm : null;

      dd < 10 ? dd = '0' + dd : null;

      return dd + '.' + mm + '.' + yyyy;
    }

    // получаем возраст
    getAge() {
      const today = new Date()
      let age = today.getFullYear() - this.birthday.getFullYear();
      let m = today.getMonth() - this.birthday.getMonth();

      m < 0 || (m === 0 && today.getDate() < this.birthday.getDate())
        ? age--
        : null

      return age;
    }

    //соединяем возраст + д/р с валидацией на падеж/число
    getBirthString() {
      let birth = this.getBirthday();

      const decade = this.getAge() % 10;
      const century = this.getAge() % 100;

      //до 21 секции делятся на 1 (год)/ 2-4 (года)/ 5-20 (лет)
      if (this.getAge() < 21) {
        if (this.getAge() == 1) {
          birth += ' (' + this.getAge() + ' год)';
        } else if (this.getAge() >= 2 && this.getAge() <= 4) {
          birth += ' (' + this.getAge() + ' года)';
        } else {
          birth += ' (' + this.getAge() + ' лет)';
        }
      }

      //с 21 года начинается деление по декадам
      //1 (год) 2-4(года) 5-9(лет)
      if (this.getAge() > 20 && this.getAge() < 100) {
        if (decade == 1) {
          birth += ' (' + this.getAge() + ' год)';
        }
        else if (decade >= 2 && decade <= 4) {
          birth += ' (' + this.getAge() + ' года)';
        }
        else {
          birth += ' (' + this.getAge() + ' лет)';
        }
      }

      //то же самое, что и декады, но остаток берем от века
      if (this.getAge() > 100) {
        if (century == 1) {
          birth += ' (' + this.getAge() + ' год)';
        }
        else if (century >= 2 && this.getAge() <= 4) {
          birth += ' (' + this.getAge() + ' года)';
        }
        else {
          birth += ' (' + this.getAge() + ' лет)';
        }
      }

      return birth;
    }

    getUnistring() {
      return (this.getFIO() + this.faculty + this.getBirthString() + this.getPeriod()).replace(/ /g, "").toLowerCase();
    }
  }

  let studentsListCopy = []
  const $tableBody = document.getElementById('table__body');

  //
  function newStudentTR(student) {
    const $studentTR = document.createElement('tr'),
      $fioTD = document.createElement('td'),
      $facultyTD = document.createElement('td'),
      $birthdayTD = document.createElement('td'),
      $periodTD = document.createElement('td'),
      $btnContainer = document.createElement('td')

    $fioTD.textContent = student.getFIO()
    $fioTD.classList.add('fioTD')

    $facultyTD.textContent = student.faculty
    $facultyTD.classList.add('facultyTD')

    $birthdayTD.textContent = student.getBirthString()
    $birthdayTD.classList.add('birthdayTD')

    $periodTD.textContent = student.getPeriod()
    $periodTD.classList.add('periodTD')

    $btnContainer.textContent = 'Удалить'
    $btnContainer.classList.add('delete-btn')
    $btnContainer.addEventListener('click', async () => {
      if (confirm('Вы уверены?')) {
        (async () => {
          await fetch(`http://localhost:3000/api/students/${$btnContainer.closest('tr').id}`, {
            method: 'DELETE',
            headers: {
              'Content-type': 'application/json',
            }
          })
          await listUpdate().then(value => spreading(value))
          console.log(await listUpdate().then(value => spreading(value)))
        })()
        $btnContainer.closest('tr').remove()
      }
    })

    $studentTR.setAttribute('id', student.id)

    $studentTR.append($fioTD)
    $studentTR.append($facultyTD)
    $studentTR.append($birthdayTD)
    $studentTR.append($periodTD)
    $studentTR.append($btnContainer)

    return $studentTR
  }
  //

  async function renderOnSubmit(student) {
    const response = await fetch('http://localhost:3000/api/students', {
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })

    studentsListCopy = await response.json()

    $tableBody.append(newStudentTR(student))

    return {
      $tableBody,
      studentsListCopy,
    }
  }

  function validation() {
    let today = new Date();

    inputs.forEach(e => {
      e.value.length > 0
        ? e.classList.remove('error')
        : e.classList.add('error')
    });

    const letterOnly = [inputsurname, inputname, inputThirdName, inputFaculty];

    //только буквы
    for (const each of letterOnly) {
      isNaN(+each.value) && each.value.length > 0
        ? each.classList.remove('error')
        : each.classList.add('error');
    }

    //д/р < today && > 1899
    if (inputbirthday.value.length > 0) {
      inputbirthday.valueAsDate.getTime() < today.getTime()
        && inputbirthday.valueAsDate.getFullYear() > 1899
        ? inputbirthday.classList.remove('error')
        : inputbirthday.classList.add('error');
    } else {
      inputbirthday.classList.add('error')
    }

    //год начала == цифра | год начала < today | год начала > д/р | год начала > 1999
    +inputstudyStart.value > 1999
      && +inputstudyStart.value < today.getFullYear()
      && inputstudyStart.value.length > 0
      && inputstudyStart.value > inputbirthday.valueAsDate.getFullYear()
      && !isNaN(+inputstudyStart.value)
      ? inputstudyStart.classList.remove('error')
      : inputstudyStart.classList.add('error');

    inputs.forEach(e => {
      if (e.classList.contains('error')) {
        const $tooltip = e.parentNode.querySelector('.tooltip')
        $tooltip.classList.add('shown')
      } else {
        const $tooltip = e.parentNode.querySelector('.tooltip')
        $tooltip.classList.remove('shown')
      }
    })

    return
  };

  //вспомнил в самом конце работы, что надо для дом элементов добавлять доллар
  //уж простите в этот раз, почти во всей работе переменные менять не хочется, главное, что я это запомнил))
  const submit = document.getElementById('submit'),
    inputs = document.querySelectorAll('.input'),
    inputsurname = document.getElementById('second-name'),
    inputname = document.getElementById('first-name'),
    inputThirdName = document.getElementById('third-name'),
    inputbirthday = document.getElementById('birthday'),
    inputFaculty = document.getElementById('faculty'),
    inputstudyStart = document.getElementById('entry-year')

  const $tableHead = document.querySelectorAll('.table__head th')

  function replacementCopy(col, prop, studentsListCopy) {
    //факультет не функция (Student.faculty)
    for (const i in studentsListCopy) {
      switch (prop) {
        case 'faculty':
          col[i].textContent = studentsListCopy[i][prop]
          break;
        default:
          col[i].textContent = equateStudents(studentsListCopy[i])[prop]()
          break;
      }
    }
    console.log('sorted')
    return
  }

  async function sortByHead(e, studentsListCopy) {
    await listUpdate().then(value => spreading(value))

    if (e.id == 'head__fio') {
      let col = document.querySelectorAll('.fioTD'),
        prop = 'getFIO'

      if (e.classList.contains('sorted')) {
        e.classList.toggle('sorted')

        studentsListCopy.sort((a, b) => {
          let fa = equateStudents(a).getFIO().replace(/ /g, "").toLowerCase(),
            fb = equateStudents(b).getFIO().replace(/ /g, "").toLowerCase();

          if (fb < fa) {
            return -1;
          }
          if (fb > fa) {
            return 1;
          }

          return 0;
        })
      } else {
        e.classList.toggle('sorted')

        studentsListCopy.sort((a, b) => {
          let fa = equateStudents(a).getFIO().toLowerCase(),
            fb = equateStudents(b).getFIO().toLowerCase();

          if (fa < fb) {
            return -1;
          }
          if (fa > fb) {
            return 1;
          }

          return 0;
        })
      }

      replacementCopy(col, prop, studentsListCopy)
    } else if (e.id == 'head__faculty') {
      let col = document.querySelectorAll('.facultyTD'),
        prop = 'faculty'

      if (e.classList.contains('sorted')) {
        e.classList.toggle('sorted')

        studentsListCopy.sort((a, b) => {

          let fa = a.faculty.toLowerCase(),
            fb = b.faculty.toLowerCase();

          if (fb < fa) {
            return -1;
          }
          if (fb > fa) {
            return 1;
          }
          return 0;
        })
      } else {
        e.classList.toggle('sorted')

        studentsListCopy.sort((a, b) => {
          let fa = a.faculty.toLowerCase(),
            fb = b.faculty.toLowerCase();


          if (fa < fb) {
            return -1;
          }
          if (fa > fb) {
            return 1;
          }
          return 0;
        })
      }
      replacementCopy(col, prop, studentsListCopy)
    } else if (e.id == 'head__birthday') {
      let col = document.querySelectorAll('.birthdayTD'),
        prop = 'getBirthString'

      if (e.classList.contains('sorted')) {
        e.classList.toggle('sorted')
        studentsListCopy.sort((a, b) => b.getAge() - a.getAge())
      } else {
        e.classList.toggle('sorted')
        studentsListCopy.sort((a, b) => a.getAge() - b.getAge())
      }

      replacementCopy(col, prop, studentsListCopy)

    } else {
      let col = document.querySelectorAll('.periodTD'),
        prop = 'getPeriod'

      if (e.classList.contains('sorted')) {
        e.classList.toggle('sorted')
        studentsListCopy.sort((a, b) => a.studyStart - b.studyStart)
      } else {
        e.classList.toggle('sorted')
        studentsListCopy.sort((a, b) => b.studyStart - a.studyStart)
      }

      replacementCopy(col, prop, studentsListCopy)
    }
    return;
  }

  const search = document.getElementById('search')
  const searchSubmit = document.getElementById('search__submit')

  //сделать асинк через сервер
  async function filter() {
    const response = await fetch(`http://localhost:3000/api/students?search=${search.value}`, {
      method: 'GET',
      headers: {
        'Content-type': 'application/json'
      }
    })
    const filterArray = await response.json()

    while ($tableBody.hasChildNodes()) {
      $tableBody.removeChild($tableBody.lastChild)
    }

    filterArray.forEach(e => {
      $tableBody.append(
        newStudentTR((equateStudents(e))))
    })

    console.log(filterArray)
    return
  }

  function clearFilter() {
    while ($tableBody.hasChildNodes()) {
      $tableBody.removeChild($tableBody.lastChild)
    }

    studentsListCopy.forEach(e => {
      $tableBody.append(newStudentTR(equateStudents(e)))
    })
  }


  searchSubmit.addEventListener('click', e => {
    e.preventDefault()
    filter()
    search.value = ''
  })

  const cancelSearch = document.getElementById('cancel')

  function equateStudents(student) {
    return new Student(student.surname,
      student.name,
      student.lastname,
      new Date(student.birthday),
      student.faculty,
      student.studyStart,
      student.id)
  }

  async function listUpdate() {
    return new Promise(async (resolve) => {
      const response = await fetch('http://localhost:3000/api/students', {
        method: 'GET',
        headers: {
          'Content-type': 'application/json'
        }
      })
      const result = await response.json()
      resolve(result.map(x => equateStudents(x)))
    })
  }

  function spreading(value) {
    let temp = [...value]
    studentsListCopy = temp.map(e => equateStudents(e))
    return studentsListCopy
  }

  async function studentsApp() {
    //проверка на существующий список
    await listUpdate().then(value => spreading(value))

    if (studentsListCopy.length > 0) {
      for (const student of studentsListCopy) {
        $tableBody.append(newStudentTR(equateStudents(student)))
      }
    }

    submit.addEventListener('click', async e => {
      e.preventDefault()

      //проверяем условия инпутов и добавляем им класс еррор + тултип (который еще надо сделать)
      validation()

      //проверяем наличие еррора и выходим из фукнции в случае наличия ошибок
      for (const each of inputs) {
        if (each.classList.contains('error')) {
          each.focus()
          return;
        }
      }
      //если ни в одном из инпутов нет еррора, то создается новый студент
      const newStudent = new Student(inputsurname.value.trim(),
        inputname.value.trim(),
        inputThirdName.value.trim(),
        inputbirthday.valueAsDate,
        inputFaculty.value.trim(),
        inputstudyStart.value.trim())

      //добавлется в список
      fetch('http://localhost:3000/api/students', {
        method: 'POST',
        body: JSON.stringify(newStudent),
        headers: {
          'Content-type': 'application/json',
        }
      })

      //обновляем список
      await listUpdate().then(value => spreading(value))

      //выполняется append текущего студента
      renderOnSubmit(newStudent);

      console.log(newStudent.getUnistring())

      inputs.forEach(e => {
        e.value = ''
      })

      return studentsListCopy
    })
    //применение сортировки в зависимости от кликнутой шапки
    $tableHead.forEach(async e => {
      e.addEventListener('click', () => {
        sortByHead(e, studentsListCopy)
      })
    })
    //отмена всех фильтров поиска
    //можно было бы сравнивать длины node коллекций, заменять текущие и удалять лишние, но че-т я не уверен, что это было бы для браузера проще
    cancelSearch.addEventListener('click', e => {
      e.preventDefault()
      clearFilter()
      search.value = '';
    })
  }
  window.studentsApp = studentsApp
})()

