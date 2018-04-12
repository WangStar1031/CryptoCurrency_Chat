/**
 * @author k.danovsky
 * created on 15.01.2016
 */
(function () {
  'use strict';

  angular.module('BlurAdmin.pages.components', [])
      .config(routeConfig)
      .service('IntelligenceService', IntelligenceService)
      .controller('IntelligenceCtrl', IntelligenceCtrl);

  /** @ngInject */
  function routeConfig($stateProvider) {
    $stateProvider
        .state('components', {
          url: '/components',
          templateUrl: 'app/pages/components/intelligence.html',
          title: 'Intelligence',
          sidebarMeta: {
            icon: 'ion-stats-bars',
            order: 100,
          },
        });
  }
  function IntelligenceService($rootScope){
    this.arrScreenNames = [];
    this.arrRelations = [];
    this.strMainName = "";
    this.nCount = 0;
    this.stateChanged = false;
    this.applyDatas = function(){
      $rootScope.$apply();
    }
    this.getScreenNames = function(_this){
      $.ajax({
          method: 'GET',
          data: {},
          url: "http://93.58.124.32/icaroai/rest/charting/getTopScreenName",
          dataType: 'json',
          success: function(data){
            _this.arrScreenNames = data;
            _this.applyDatas();
          }
      });
    }
    this.getScreenNameData = function(){
      return this.arrScreenNames;
    }
    this.getRelationData = function(_this, _nLevel, _nRelation){
      $.ajax({
          method: 'GET',
          data: {},
          url: "http://93.58.124.32/icaroai/rest/charting/getGraphData/" + _nLevel + "/" + _nRelation,
          dataType: 'json',
          success: function(data){
            _this.arrRelations = data;
            _this.applyDatas();
          }
      });
    }
    this.getRelations = function(){
      return this.arrRelations;
    }
    this.getNodes = function( _nLevel, _nRelation){
      this.getRelationData(this, _nLevel, _nRelation);
    }
    this.setMainNodeName = function(_MainNodeName){
      // if( this.strMainName == _MainNodeName)return;
      this.strMainName = _MainNodeName;
      var _this = this;
      $.ajax({
        method : 'GET',
        data : {},
        url : 'http://93.58.124.32/icaroai/rest/charting/insertRelations/' + _MainNodeName + '/' + 2 +'/0000-01-31T00:00:42/9999-12-31T00:00:42',
        dataType : 'json',
        success : function(data){
          _this.nCount = data;
          _this.stateChanged = !_this.stateChanged;
          _this.applyDatas();
        }
      })
    }
    this.getRelationCount = function(){
      return this.nCount;
    }
    this.getScreenNames(this);
  }
  function IntelligenceCtrl($scope, IntelligenceService){
    $scope.withSearchItem = {};
    $scope.arrScreenNames = [];
    $scope.nMasterLevel = 3;
    $scope.nLevel = 3;
    $scope.nRelations = 2;
    $scope.selectedName = "";
    $scope.isFirst = true;
    var curDate = new Date();
    $scope.startDate = curDate.getDate() + "/" + (curDate.getMonth()+1) + "/" + (curDate.getYear()+1900);
    $scope.endDate = curDate.getDate() + "/" + (curDate.getMonth()+1) + "/" + (curDate.getYear()+1900);
    // $scope.startTime = "";
    // $scope.endTime = "";
    $('#schedulaStart').datepicker({ locale: 'it', format: 'dd/mm/yyyy', autoclose: true, useCurrent: true });
    $('#schedulaEnd').datepicker({ locale: 'it', format: 'dd/mm/yyyy', autoclose: true, useCurrent: true });

    $scope.service = IntelligenceService;
    $scope.$watch('service.getScreenNameData()', function(_newData){
      $scope.arrScreenNames = _newData;
    });
    $scope.getMainName = function(){
      var strMainNodeName = $(".mainScreenName .ui-select-match-text.pull-left span").eq(0).html();
      if(!strMainNodeName)return;
      strMainNodeName = strMainNodeName.replace(/\t/g,"");
      strMainNodeName = strMainNodeName.replace(/\n/g,"");
      return strMainNodeName;
    }
    $scope.onSearch = function(){
      var strMainNodeName = $scope.getMainName();
      $(".waiting").addClass("HideItem");
      $scope.service.setMainNodeName(strMainNodeName, $scope.startDate, $scope.endDate);
      $(".waiting").removeClass("HideItem");
    }
    $scope.onApply = function(){
      $scope.service.getNodes($scope.nLevel, $scope.nRelations);      
    }
    $scope.$watch('service.stateChanged', function(_new){
      var _newData = IntelligenceService.getRelationCount();
      if( _newData == 0){
        if( $scope.isFirst == true){
          $scope.isFirst = false;
          return;
        }
        alert("There is no Relations.");
        $(".waiting").removeClass("HideItem");
        return;
      }
      $scope.onApply();
    });
    $scope.$watch('service.getRelations()', function(_newData){
      var strMainNodeName = $scope.getMainName();
      $(".intelligenceChart").html("");
      $scope.drawRelationChart(strMainNodeName, _newData);
      $(".waiting").addClass("HideItem");
    });
    $scope.circleClicked = function(_strScreenName){
      // alert(_strScreenName);
      setCookie("IndividualScreenName", _strScreenName, 1);
      window.open("Intelligence_individual.html");
      window.open("Twitter_individual.html");
    }
    $scope.pathClicked = function(_strFromName, _strToName, _strValue){
      // alert(_strFromName + ":" + _strToName + ":" + _strValue);
      setCookie("FromScreenName", _strFromName);
      setCookie("ToScreenName", _strToName);
      window.open("Intelligence_From_To.html");
      window.open("Twitter_From_To.html");
    }
    $scope.drawRelationChart = function(strMainNodeName, _newData){

      var width = 900;
      var height = 600;

      var chart = d3.select(".intelligenceChart")
        .attr("width", width)
        .attr("height", height);
      if( _newData.length == 0)return;
      var colors = d3.scaleOrdinal(d3.schemeCategory10);

      // d3.json("https://raw.githubusercontent.com/DealPete/forceDirected/master/countries.json", function(error, data) {
      // d3.json(_newData, function(error, data) {
      var data = _newData;
        var simulation = d3.forceSimulation(data.nodes)
          .force("forceX", d3.forceX().strength(.1).x(width / 2))
          .force("forceY", d3.forceY().strength(.1).y(height / 2))
          .force("link", d3.forceLink(data.links))//.id(function(d) { return d.country; }))
          .force("charge", d3.forceManyBody(-30))
          .force("center", d3.forceCenter(width / 2, height / 2))


        // build the arrow.
        chart.append("svg:defs").selectAll("marker")
            .data(["end"])      // Different link/path types can be defined here
          .enter().append("svg:marker")    // This section adds in the arrows
            .attr("id", "triangle")
            .attr("viewBox", "0 -5 10 10")
            .attr("refX", 15)
            .attr("refY", -1.5)
            .attr("markerWidth", 5)
            .attr("markerHeight", 5)
            .attr("orient", "auto")
            .attr("style", "fill:white")
          .append("path")
            .attr("d", "M0,-5L10,0L0,5");

        var link = chart.append("g")
          .attr("class", "links")
          .selectAll("line")
          .data(data.links)
          .enter().append("line")
            .attr("sourceName", function(d){ 
              // debugger;
              var nSourceId = d.source.id;
              var node = data.nodes.filter(function(d){
                return d.id == nSourceId;
              });
              return node[0].screenname;
            })
            .attr("targetName", function(d){ 
              var nTargetId = d.target.id;
              var node = data.nodes.filter(function(d){
                return d.id == nTargetId;
              });
              return node[0].screenname;
            })
            .attr("value", function(d){return d.numbersTweet;})
            .attr("stroke-width", 3).attr("marker-end","url(#triangle)");;
          // .enter().append("svg:path")
          //   .attr("class", "link")
          //   .attr("marker-end", "url(#end)");

        var node = chart.append("g")
          .attr("class", "nodes")
          .selectAll("circle")
          .data(data.nodes)
          .enter().append("circle")
          .attr("screenname", function(d){
            return d.screenname;
          })
          .attr("r", 4)
          .attr("fill",function(d, i) { return colors(i); });
          // .call(d3.drag()
          //   .on("start", dragstarted)
          //   .on("drag", dragged)
          //   .on("end", dragended));

        node.append("title")
          .text(function(d) { return d.screenname; });


        simulation
          .nodes(data.nodes)
          .on("tick", ticked);

        simulation.force("link")
         .links(data.links);

        function ticked() {
          link
            .attr("x1", function(d) { return d.source.x; })
            .attr("y1", function(d) { return d.source.y; })
            .attr("x2", function(d) { return d.target.x; })
            .attr("y2", function(d) { return d.target.y; });

          node
            .attr("cx", function(d) { return d.x; })
            .attr("cy", function(d) { return d.y; });
        }
        function dragstarted(d) {
          if (!d3.event.active) simulation.alphaTarget(0.3).restart();
          d.fx = d.x;
          d.fy = d.y;
        }

        function dragged(d) {
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        }

        function dragended(d) {
          if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }
        $(".nodes circle").on("click", function(e){
          $scope.circleClicked( this.getAttribute("screenname"));
        });
        $(".nodes circle").hover(function(){
          this.classList.add("activeCircle");
        }, function(){
          this.classList.remove("activeCircle");
        });
        $(".links line").hover(function(){
          var strFromName = this.getAttribute("sourceName");
          var strToName = this.getAttribute("targetName");
          var strValue = this.getAttribute("value");
          this.classList.add("activeLink");
          $("#fromName").html(strFromName);
          $("#toName").html(strToName);
          $("#linkCount").html(strValue);
          $("#LineDetails").css({left:xPos+10, top:yPos});
          $("#LineDetails").removeClass("HideItem").addClass("ShowItem");
        }, function(){
          this.classList.remove("activeLink");
          $("#LineDetails").removeClass("ShowItem").addClass("HideItem");
        });
        $(".links line").on("click", function(e){
          var strFromName = this.getAttribute("sourceName");
          var strToName = this.getAttribute("targetName");
          var strValue = this.getAttribute("value");
          $scope.pathClicked( strFromName, strToName, strValue);
        })
    }
  }

})();
