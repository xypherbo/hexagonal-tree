angular.module("Trello", [
    'ngSanitize', 'ngCsv'
]).controller("TrelloController", function ($scope, $http) {
    console.log("Hello Angular");


    $scope.getBoard = function () {
        $http({
            method: 'GET',
            url: 'https://api.trello.com/1/members/me?boards=starred&board_fields=name&organizations=all&organization_fields=displayName&key=' + $scope.trelloKey + '&token=' + $scope.trelloToken
        }).then(function successCallback(response) {
            console.log(response);
            $scope.boardList = response.data.boards;
        }, function errorCallback(response) {
            console.log(response);
        });
    }


    $scope.getList = function () {
        $http({
            method: 'GET',
            url: 'https://api.trello.com/1/boards/' + $scope.boardName.id + '?lists=open&list_fields=name&fields=name,desc&key=' + $scope.trelloKey + '&token=' + $scope.trelloToken
        }).then(function successCallback(response) {
            console.log("LIST");
            console.log(response);
            $scope.listColumn = response.data.lists;

            $http({
                method: 'GET',
                url: 'https://api.trello.com/1/boards/' + $scope.boardName.id + '/members?key=' + $scope.trelloKey + '&token=' + $scope.trelloToken
            }).then(function successCallback(response) {
                console.log("MEMBER");
                console.log(response);
                $scope.member = response.data;
            }, function errorCallback(response) {
                console.log(response);
            });
        }, function errorCallback(response) {
            console.log(response);
        });
    }

    $scope.exports = function () {
        $http({
            method: 'GET',
            url: 'https://api.trello.com/1/lists/' + $scope.doneListName.id + '?fields=all&cards=all&card_fields=all&key=' + $scope.trelloKey + '&token=' + $scope.trelloToken
        }).then(function successCallback(response) {
            console.log(response);

            var cards = response.data.cards;
            console.log(cards);
            var inMonthCards = [];

            var now = new Date();
            var startDateMoment = moment(now.getFullYear() + "-" + $scope.month + "-01").startOf('month').format('YYYY-MM-DD');
            console.log(startDateMoment);
            var endDateMoment = moment(now.getFullYear() + "-" + $scope.month + "-01").endOf('month').format('YYYY-MM-DD');
            console.log(endDateMoment);

            var startDate = new Date(startDateMoment).getTime();
            var endDate = new Date(endDateMoment).getTime();


            //filter due
            cards.forEach(function (card) {
                var dueTime = new Date(card.due);
                if (startDate < dueTime && endDate > dueTime) {
                    inMonthCards.push(card);
                }
            });

            console.log(inMonthCards);

            var cardsBymember = {};

            //แยก member
            inMonthCards.forEach(function (card) {
                if (!cardsBymember[card.idMembers[0]]) {
                    cardsBymember[card.idMembers[0]] = [];
                }
                cardsBymember[card.idMembers[0]].push(card);
            });


            //group by due
            for (var key in cardsBymember) {
                if (cardsBymember.hasOwnProperty(key)) {
                    var memberCards = cardsBymember[key];

                    var memberDue = {};
                    memberCards.forEach(function (card) {
                        if (!memberDue[card.due]) {
                            memberDue[card.due] = [];
                        }
                        memberDue[card.due].push(card);


                    });
                    memberCards.groupDue = memberDue;
                    console.log(memberCards);
                }
            }

            var retData = [];

            console.log(cardsBymember);


            //จัดเป็น csv
            for (var memberid in cardsBymember) {
                if (cardsBymember.hasOwnProperty(memberid)) {
                    var member = cardsBymember[memberid];


                    for (var date in member.groupDue) {
                        if (member.groupDue.hasOwnProperty(date)) {
                            var dueCard = member.groupDue[date];

                            var listCard = [];
                            var sumhour = 0;
                            dueCard.forEach(function (card) {
                                listCard.push((card.idShort).toString());
                                var indexFirst = card.name.indexOf("(");
                                var indexLast = card.name.indexOf(")");
                                var value = card.name.substring(indexFirst + 1, indexLast);
                                console.log("value is " + value);
                                sumhour += parseFloat(value);
                            });

                            var temp = {
                                listCard: listCard.join(","),
                                boardName: $scope.boardName.name,
                                date: moment(date).format('MM/DD/YYYY'),
                                username: memberid,
                                summary: sumhour
                            }
                            console.log(temp);
                            retData.push(temp);
                        }
                    }
                }
            }

            console.log(retData);

            //transform name
            retData.forEach(function (row) {
                $scope.member.forEach(function (member) {
                    if (member.username == row.username) {
                        row.username = member.username;
                    }
                });
            });
            $scope.exportData = retData;



            function csv(arr) {
                var ret = [];

                var rowstringarr = [];

                arr.forEach(function (row) {
                    var rowarr = [];

                    for (var key in row) {
                        if (row.hasOwnProperty(key)) {
                            var element = row[key];
                            rowarr.push(element);
                        }
                    }

                    var innerstring = "'" + rowarr.join("','") + "'";
                    rowstringarr.push(innerstring);
                });

                return rowstringarr.join('\n');
            }

            var saving = document.createElement('a');

            saving.href = 'data:attachment/csv,' + encodeURIComponent(csv($scope.exportData));
            saving.download = 'Summary.csv';
            saving.click();

        }, function errorCallback(response) {
            console.log(response);
        });
    }

});