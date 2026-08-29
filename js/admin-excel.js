/**
 * 管理台 Excel 模板：导出当前配置，填完再导入。
 */
(function (global) {
    function needXlsx() {
        if (!global.XLSX) throw new Error('Excel 组件未加载');
        return global.XLSX;
    }

    function pick(row, names) {
        if (!row) return '';
        var i;
        for (i = 0; i < names.length; i++) {
            if (row[names[i]] != null && String(row[names[i]]).trim() !== '') {
                return String(row[names[i]]).trim();
            }
        }
        var map = {};
        Object.keys(row).forEach(function (k) {
            map[String(k).replace(/\s+/g, '')] = row[k];
        });
        for (i = 0; i < names.length; i++) {
            var v = map[String(names[i]).replace(/\s+/g, '')];
            if (v != null && String(v).trim() !== '') return String(v).trim();
        }
        return '';
    }

    function isYes(v) {
        var s = String(v == null ? '' : v).trim();
        if (!s) return true;
        return /^(是|上架|y|yes|true|1)$/i.test(s);
    }

    function yesNo(on) {
        return on === false ? '否' : '是';
    }

    function rowsOf(wb, name, hints) {
        var XLSX = needXlsx();
        function json(sheet) {
            return XLSX.utils.sheet_to_json(sheet, { defval: '', raw: false });
        }
        function matchHints(rows) {
            if (!hints || !hints.length || !rows.length) return true;
            var keys = Object.keys(rows[0] || {});
            return hints.some(function (h) {
                return keys.some(function (k) { return String(k).replace(/\s+/g, '') === String(h).replace(/\s+/g, ''); });
            });
        }
        if (name && wb.Sheets[name]) {
            var exact = json(wb.Sheets[name]);
            if (matchHints(exact)) return exact;
        }
        var hit = (wb.SheetNames || []).find(function (n) { return n.indexOf(name) !== -1; });
        if (hit) {
            var named = json(wb.Sheets[hit]);
            if (matchHints(named)) return named;
        }
        var i;
        for (i = 0; i < (wb.SheetNames || []).length; i++) {
            var rows = json(wb.Sheets[wb.SheetNames[i]]);
            if (rows.length && matchHints(rows)) return rows;
        }
        return [];
    }

    function book(sheets) {
        var XLSX = needXlsx();
        var wb = XLSX.utils.book_new();
        sheets.forEach(function (s) {
            var ws = XLSX.utils.aoa_to_sheet(s.rows || [[]]);
            if (s.cols) ws['!cols'] = s.cols.map(function (w) { return { wch: w }; });
            XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
        });
        return wb;
    }

    function download(filename, sheets) {
        var XLSX = needXlsx();
        var wb = book(sheets);
        if (typeof XLSX.writeFile === 'function') {
            XLSX.writeFile(wb, filename);
            return;
        }
        var out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        var blob = new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        var a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = filename;
        a.click();
        setTimeout(function () { URL.revokeObjectURL(a.href); }, 800);
    }

    function readFile(file) {
        return new Promise(function (resolve, reject) {
            var XLSX = needXlsx();
            var reader = new FileReader();
            reader.onload = function () {
                try {
                    resolve(XLSX.read(reader.result, { type: 'array' }));
                } catch (e) {
                    reject(new Error('无法读取 Excel，请确认是 .xlsx 文件'));
                }
            };
            reader.onerror = function () { reject(new Error('无法读取文件')); };
            reader.readAsArrayBuffer(file);
        });
    }

    global.YouweiExcel = {
        pick: pick,
        isYes: isYes,
        yesNo: yesNo,
        rowsOf: rowsOf,
        download: download,
        readFile: readFile
    };
})(window);
