$(function () {
    let blockCounter = 0;

    const $editor = $('#editor');
    const $levelId = $('#level-id');

    function createItem(CatapultData, item) {
        if (item == "catapult" && document.querySelectorAll(".catapult").length >= 1) return;
        const id = CatapultData.id


        const newItem = $('<div></div>')
            .addClass(item)
            .addClass("item")
            .attr('id', id)
            .css({
                top: CatapultData.y,
                left: CatapultData.x,
                width: CatapultData.width,
                height: CatapultData.height,
            })
            .appendTo($editor)

        newItem.draggable({
            containment: "#editor"
        });

        newItem.on("contextmenu", function (e) {
            e.preventDefault();
            if (confirm("Delete this block")) {
                $(this).remove();
            }
        });

        return newItem;
    }

    function collectBlocks() {

        const elements = [];
        $(".item").each(function () {
            const b = $(this);
            console.log("this is B: ", b[0].classList[0]);
            const pos = b.position();
            elements.push({
                id: b.attr('id'),
                x: pos.left,
                y: pos.top,
                width: b.width(),
                height: b.height(),
                type: b[0].classList[0]
            });
        });
        return elements;
    };

    function renderLevel(blocks) {
        $editor.empty();
        blockCounter = 0;
        blocks.forEach(b => {
            createItem(b, b.type);
        })
    }

    $('#add-block').click(function () {
        createItem({}, 'block');
    });
    $('#add-triangle').click(function () {
        createItem({}, 'triangle');
    });
    $('#add-plank').click(function () {
        createItem({}, 'plank');
    });
    $('#add-enemy').click(function () {
        createItem({}, 'enemy');
    });
    $('#add-catapult').click(function () {
        createItem({}, 'catapult');
    });

    $('#save-level').click(function () {
        const blocks = collectBlocks();

        if (blocks.length === 0) {
            alert('The level is empty. Add some blocks before saving.');
            return;
        }

        const id = $levelId.val().trim();
        const payload = { blocks };

        let method, url;
        if (id) {

            method = 'PUT';
            url = '/api/v1/levels/' + encodeURIComponent(id);
        } else {
            method = 'POST';
            url = '/api/v1/levels';
        }

        $.ajax({
            url,
            method,
            contentType: 'application/json',
            data: JSON.stringify(payload),
            success: function (response) {

                alert(response.message + ' (ID = ' + response.id + ')');

                if (!id) {

                    $levelId.val(response.id);
                }

            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error saving level: ' + msg);
            }
        });
    });

    $('#load-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to load.');
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'GET',
            contentType: 'application/json',
            success: function (response) {
                renderLevel(response.blocks || []);
                alert('Level loaded successfully.');
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error loading level: ' + msg);
            }
        });
    });

    $('#delete-level').click(function () {
        const id = $levelId.val().trim();

        if (!id) {
            alert('Please enter a Level ID to delete.');
            return;
        }

        if (!confirm(`Are you sure you want to delete level "${id}"?`)) {
            return;
        }

        const url = '/api/v1/levels/' + encodeURIComponent(id);

        $.ajax({
            url,
            method: 'DELETE',
            success: function () {
                alert('Level deleted.');

                $levelId.val('');
                $editor.empty();
            },
            error: function (xhr) {
                const msg = xhr.responseJSON?.error || xhr.responseText || 'Unknown error';
                alert('Error deleting level: ' + msg);
            }
        });
    });

});

