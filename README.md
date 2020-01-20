# FactorySimulation

Celem projektu jest stworzenie przykładowej aplikacji pokazującej możliwości takich narzędzi jak ngxs, rxjs w obszarze dynamicznie tworzonego stora
a konkretnie: 
*  ngxs pokazać jak ogólnie go urzywać głównie z naciskiem na dynamiczne tworzenie i usuwanie fragmentów stora
*  rxjs pokazać jak używać w trochę większej aplikacji
*  połaczenie technologii ngxs i rxjs aby pokazać jak można te rozwiazania łączyć
*  cel szkoleniowy - pokazanie różnych możliwości 

Za przykład posłużyła symulacja funkcjonowania fabryki produkującej motocykle, samochody i vany. 
Celem fabryki jest zarabiać, zapytania ofertowe przychodzą z rynku, fabryka je wykonuje 
za pomocą departamentów umiejscowionych na kontynentach. W obrębie każdego departamentu mogą być uruchomione linie produkcyjne, które to mogą
wykonywać zamówienia równolegle. Główna pętla systemu to 
1.  wygeneruj zapytanie ofertowe z rynku i przekaż do fabryki
2.  podejmij decyzję czy możesz je wykonać, możliwe opcje to:
    *  odrzucenie, brak możliwości technicznych do wykonania
    *  wykonanie za pomocą aktualnej linii produkcyjnej (pod warunkiem że bufory nie są zapełnione)
    *  wykonanie za pomocą nowo utworzonej linii (pod warunkiem że ilość linii nie jest przekroczona i mamy kasę na jej otworzenie)
    *  wykonanie za pomocą nowo utworzonego departamentu i linii (pod warunkiem że ilości nie przekroczone i mamy kasę)
3.  Jeśli zapytanie ofertowe może być przyjęte zamieniamy je na zamówienie i przekazujemy ją do wybranje linii
4.  każde zamówienie jest przetwarzane w linii gdzie czas wykonania zamówienia zależy od ilosci kroków produkcji (tick) oraz ilośći zamówienia
5.  W trakcie pracy nad zamówieniem przekazujemy koszty produkcji do centrali, a w przypadku zakończenia zamówienia także wielkość sprzedaży
6.  na zwolnione miejce w produkcji wpada następne zamówienie
7.  Centrala monitoruje stan kasy firmy i albo wszyskto jest ok i zarabiasz albo tracisz, jak braknie kasy stajesz się bankrutem

model uml fabryki znajduje się pod adresem: [uml](https://areen3.github.io/factory-simulation/).
plik narzęcia case (Enterprice Architect jest pod adresem): [case](https://areen3.github.io/factory-simulation/factory-simulation.eapx)
(model procesów jeste jeszcze do poprawy)
przykład w formie filmu wraz z wytłumaczeniem znajduje się [here]()

## Możliwości sterowania fabryką w czasie rzeczywistym (zmniejszenie powoduje wygaszanie w czasie tego co zmniejszamy)
Głównymi parametrami są: 
1.  Market demand symulaujące zapotrzebowanie z rynku, symulacja jest za pomocą funkcji sinus (aby mieć różne wartości) wraz z pewnymi odchyleniami
2.  Paraller production ilośc elementów które linia może równolegle produkować
3.  Max dep. count ilość fabryk na kontynencie
4.  Max lines ilość linii produkcyjnych w fabryce
5.  Tick to produce one element - ilość taktów pracy fabryki aby wyprodukować jedene element
6.  Budget start ilość kasy jaką mamy na starcie, jak zrobimy się bankrutem to możemy dofinansować i uruchomić symulację ponownie
7.  Time Speed - szybkość generacji kroków fabryki (rzeczywista szybkość jest pokazywana za pomocą wskaźnika: Tick duration)
8.  tryb experta pozwala sterować tymi parametrami z podziałem na kontynenty, departamenty, linie, produkty

Elementy ekranu (start, stop) i :
1.  Market demand pokazuje wykres symulowanego zapotrzebownaia z rynku
2.  Offers state pokazuje stan ofert, co przyjeliśmy co produkujemy, co odrzuciliśmy
3.  Orders state pokazuje stan zamówień które powstały na bazie ofert, co jest w buforze produkcji, co produkujemy, co zakończliśmy
4.  Company finances pokazuje ogólną kondycję Twojej fabryki
5.  Product sales pokazuje wielkość sprzedaży z podziałem na produkty
6.  Containent sales pokazuje wielość sprzedaży z podziałem na kontynenty
7.  Poniżej pokazane są kontynenty, departamenty, linie wraz z stanem jak produkcja przebiega

poniżej są przedstawione poszczególne (moim zdaniem) ciekawsze konstrukcje programistyczne w podziale na
*  podstawy - czyli ciekwasze konstrukcje javascript
*  angular - czyli ciekawsze kontrukcje dostarczane przez angulara
*  ngxs - przyklady użycia w różnych przypadkach
*  rxjs - przykłady konstrukcji użytych dostarczanych przez rxjs

## jak należy patrzeć na ten przykład
1.  Jeśli chcesz zrozumieć mechanikę całości, przestudiuj umla, procesy i postaraj sie znaleźć w kodzie główny proces z odnogami
2.  Jeśli chcesz zobaczyć co ciekawego  można uzyskać przeczytaj poniższe punkty w celu zobaczenia ciekawszych rzeczy

Do oznaczania w kodzie elementów użyłem // REVIEW
możesz znaleźć w kodzie wskazany element albo przez toolbar z lewej strony albo przez wyszukanie ciągu znaków // REVIEW 
w review zanajdziesz zarówno elementy proste jak i trudniejsze 

## javascript  
* // REVIEW js example generic interface without specific type
* // REVIEW js example type declaration
* // REVIEW js example nested interface declaration
* // REVIEW js example enum declaration
* // REVIEW js example index type declaration
* // REVIEW js example index type declaration in storyge
* // REVIEW js example index type declaration in default
* // REVIEW js example index type using
* // REVIEW js example of inicjalization index of string
* // REVIEW js example of changing index map to array
* // REVIEW js example of pick type using
* // REVIEW js example of joining tables
* // REVIEW js example of simple sum array
* // REVIEW js example of joining tables by spread
* // REVIEW js example of declare array with inicjalization and process by map
* // REVIEW js example of reduce array to map
* // REVIEW js example of recude with type params declaration
* // REVIEW js example of change array of ordres to index with mapping strucutre
* // REVIEW js example of count properise in object
* // REVIEW js example of shallow copy of object
* // REVIEW js example of delete property from object
* // REVIEW js example of chaing array processing
* // REVIEW js example of sort array
* // REVIEW js example of joining object
* // REVIEW js example of declare return type from array function
* // REVIEW js example of few arrat chains
* // REVIEW js example of math function to make random, sinus, range ...


## angular
* // REVIEW angular example of decorator
* // REVIEW angular example of using decorator
* // REVIEW angular example of one binding to observale in template *ngIf="data$ | async as data">
* // REVIEW angular example how to get data from observable without subscribing
* // REVIEW angular example of tree child component strucuture word/conatinet/departament/line/progress


## rjxj
* // REVIEW rxjs example of stop stream 
* // REVIEW rxjs example of changing array to object
* // REVIEW rxjs example of chain that procude element in factory
* // REVIEW rxjs example of removing part of store
* // REVIEW rxjs example of get data from combineLatest
* // REVIEW rxjs example of join another setream to main stream and example of semafor
* // REVIEW rxjs example of use join stream
* // REVIEW rxjs example of divde steram
* // REVIEW rxjs example of sending value to semafor
* // REVIEW rxjs example of processing array of stream orders
* // REVIEW rxjs example of nesting stream
* // REVIEW rxjs example of making swich in steams
* // REVIEW rxjs example of making swich in steream - only one of merga can be successed
* // REVIEW rxjs example of making case in switch in stream -simple filter
* // REVIEW rxjs example of finish stream
* // REVIEW rxjs example of starting new stream
* // REVIEW rxjs example of logging in rxjs
* // REVIEW rxjs example of logging in rxjs
* // REVIEW rxjs example of scan range of data in stream to make averrage value from it
* // REVIEW rxjs example tag stream to rxjs_spy
* // REVIEW rxjs example how to store data in stream that show in chart
* // REVIEW rxjs example how check if simulation runs and take disable components


## ngxs
* // REVIEW ngxs example base action without parameters
* // REVIEW ngxs example base action with parameters
* // REVIEW ngxs example how to ogranise actions
* // REVIEW ngxs action with object parameters
* // REVIEW ngxs example action command name convention 
* // REVIEW ngxs example action event name convention
* // REVIEW ngxs example action event type
* // REVIEW ngxs example model declaration
* // REVIEW ngxs example using model declaration part 1
* // REVIEW ngxs example using model declaration part 2
* // REVIEW ngxs example using model declaration part 3
* // REVIEW ngxs example base state that You can inherited
* // REVIEW ngxs example state that inherited from base
* // REVIEW ngxs example injection of state, useful for dynamic create without write it in forRoot
* // REVIEW ngxs example static child state
* // REVIEW ngxs example simple decorator @selector
* // REVIEW ngxs example decorator @state
* // REVIEW ngxs example decorator @action
* // REVIEW ngxs example decorator @state, useful for return all state but dengerous beacuse it monitoring all changes in children
* // REVIEW ngxs example for changing state
* // REVIEW ngxs example of return observable action, system wil wait for execute these action
* // REVIEW ngxs example of parameterized  selector
* // REVIEW ngxs example of using parameterized  selector
* // REVIEW ngxs example of update one element in index structure
* // REVIEW ngxs example of base state class for inheritance in feature
* // REVIEW ngxs example of using onDestroy part 1
* // REVIEW ngxs example of using onDestroy part 2
* // REVIEW ngxs example of selector that return object, little dengerous becasue for any changes in storyge it return different value
* // REVIEW ngxs example of building array of action that will be send
* // REVIEW ngxs example sending array of actions
* // REVIEW ngxs example of observable ngxs action
* // REVIEW ngxs example of getting data form observable action
* // REVIEW ngxs example of take snapshot from specific location
* // REVIEW ngxs example of dispatching action to specific location
* // REVIEW ngxs example of using ngxsOnInit
* // REVIEW ngxs example of process action in inherited states (car, motocycle, ...)
* // REVIEW ngxs example of removing part of store
* // REVIEW ngxs example of get part of state from location
* // REVIEW ngxs example how to add new state in localization
* // REVIEW ngxs example how to append element to array using operators
* // REVIEW ngxs example how to joins index of offer with array of offer, chang it to index and patch to state
* // REVIEW ngxs example how to dispatch action from component
* // REVIEW ngxs example how to subscribe dynamicliy on created new element of store

