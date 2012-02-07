

;(function($){
	
	var _targets = [];
	
	
	
	var _area = function() {
		
		if ( arguments[0] ) {
			$context = arguments[0];
		} else {
			$context = $(window);
		}
		
		return {
			startY:		$context.scrollTop(),
			endY:		$context.scrollTop() + $context.height(),
			startX:		$context.scrollLeft(),
			endX:		$context.scrollLeft() + $context.width()
		};
		
	};
	
	
	var _domInfo = function( $obj ) {
		
		var offset = $obj.offset();
		
		return {
			startY:		offset.top,
			endY:		offset.top + $obj.outerHeight(),
			startX:		offset.left,
			endX:		offset.left + $obj.outerWidth()
		}
		
	};
	
	
	var _portionInfo = function( dom, area ) {
		
		// Create portion's limit properties
		var p = $.extend({},dom,{});
		if ( dom.startX < area.startX ) p.startX 	= area.startX;
		if ( dom.endX > area.endX)		p.endX 		= area.endX;
		if ( dom.startY < area.startY ) p.startY 	= area.startY;
		if ( dom.endY > area.endY)		p.endY 		= area.endY;
		
		// Original dom dimensins and area
		dom.w = dom.endX - dom.startX;
		dom.h = dom.endY - dom.startY;
		dom.a = dom.w * dom.h;
		
		// Portion dimensions, area and percentage.
		p.w = p.endX - p.startX;
		p.h = p.endY - p.startY;
		p.a = p.w * p.h;
		p.perc = p.a * 100 / dom.a;
		
		return p;
		
	};
	
	
	var _isVisible = function( dom, area ) {
		
		var r = true;
		
		//console.log( area.startY + " // " + dom.endY );
		
		if ( area.startY >= dom.endY ) r = false;
		
		if ( dom.startY >= area.endY ) r = false;
		
		if ( area.startX >= dom.endX ) r = false;
		
		if ( dom.startX >= area.endX ) r = false;
		
		
		return r;
		
	}
	
	
	var _isContained = function( dom, area ) {
	
		var r = true;
		
		if ( area.startY > dom.startY ) 	return false;
		if ( dom.endY > area.endY ) 		return false;
		
		if ( area.startX > dom.startX ) 	return false;
		if ( dom.endX > area.endX ) 		return false;
		
		return r;
	
	}
	
	
	
	/**
	 * The Logic
	 * on each scroll event
	 */
	var _check = function() {
		
		// This action can be invoked into a scroll() event or stand alone.
		var e = false;
		if ( arguments[0] ) e = arguments[0];
		
		if ( e ) this.cfg.scroll.call( this.$, e );
		
		// Info about visible area can be provided by the scroll() event or
		// have to be calculated here!
		var area = false;
		if ( arguments[1] ) area = arguments[1]; else area = _area();
		
		var dom = _domInfo( this.$ );
		
		// Fetch item position info:
		var visible 	= _isVisible( dom, area );
		var contained 	= _isContained( dom, area );
		
		
		
		// Entering events:
		if ( !this.contained && contained ) {
			this.cfg.callback.call( this.$, 'enter' );
			this.cfg.enter.call( this.$ );
			
		} else if ( !this.visible && visible ) {
			this.cfg.callback.call( this.$, 'startEnter' );
			this.cfg.startEnter.call( this.$ );
			
		}
		
		
		// Exiting events:
		if ( this.visible && !visible ) {
			this.cfg.callback.call( this.$, 'exit' );
			this.cfg.exit.call( this.$ );
			
		} else if ( this.contained && !contained ) {
			this.cfg.callback.call( this.$, 'startExit' );
			this.cfg.startExit.call( this.$ );
			
		}
		
		if ( visible && !contained ) {
			this.cfg.callback.call( this.$, 'portion', _portionInfo(dom,area) );
			this.cfg.portion.call( this.$, _portionInfo(dom,area) );
		}
		
		
		this.visible 	= visible;
		this.contained 	= contained;
	
	};
	
	
	
	
	
	
	/**
	 * The Plugin
	 */
	$.fn.scrollIn = function(cfg) {
		
		var obj, found, config, i;
		
		// Callback to configuration object.
		if ( (typeof cfg) == 'function' ) cfg = { callback: cfg };
		
		// Creates a complete config object.
		config = $.extend({},{
			callback: 	function( action ) {},
			startEnter:	function() {},
			enter:		function() {},
			startExit:	function() {},
			exit:		function() {},
			portion:	function( portion ) {},
			scroll:		function() {},
			
		t:'e'},cfg);
		
		// Add targets to the global array to be listened on document scrolling event.
		$(this).each(function(){
			
			obj = {
				_:					this,
				$:					$(this),
				cfg:				config,
				visible:			false,
				partialVisible:		false
			};
			
			// Check against multiple initializations.
			// If an element is added more than once it will be extended with new configuration.
			found = false;
			
			for ( i=0; i<_targets.length; i++ ) {
				
				if ( _targets[i]._ == obj._ ) {
					
					_targets[i].cfg = $.extend({},_targets[i].cfg,obj.cfg);
					
					found = true;
					
				}
				
			}
			
			// Add new item to the list of target items.
			if ( !found ) {
			
				_check.call(obj);
				
				_targets.push(obj);	
				
			}
		
		});
		
		return this;
	
	};
	
	
	
	
	
	/**
	 * The Functional Code
	 * any ideas about this code optimization??
	 */
	
	$(window).bind('scroll',function(e){
		
		// Fetch the window's visible area info once for each scroll event.
		// (load balance optimization)
		var a = _area();
		
		// Walk through the active items to define if they are visible or not!
		for ( var i=0; i<_targets.length; i++ ) _check.call( _targets[i], e, a );
		
			
	});
	
	
})(jQuery);