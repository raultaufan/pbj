function BalikanHeaderFINAL (stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord) {
	var helpernya = require('../definitions/helper');

	var teksnya = helpernya.BalikanHeaderFINALOK(stsres, stsdes, stsfal, note, req, receivetime, datanya, totalrecord);
	return teksnya;
};

exports.APIOpenPerusahaan = function(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime){
    var initializePromise = OpenPerusahaan(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime);
    initializePromise.then(function() {
        
    }, function(err) {
        console.log(err);
        self.json(JSON.parse(BalikanHeaderFINAL("false", err, "error", "Perhatikan parameter yang dikirimkan.", JSON.stringify(req), receivetime, "", 0)));
    });
};


function OpenPerusahaan(katakunci, sortby, sortbyasc, filterby, filter, page, limit, self, req, receivetime) {
	return new Promise(function(resolve, reject) {
        var db = DBMS();
        var async = require('async');
		var buatjson = [];

        if (page < 0 || typeof page != "number") {
			reject('Nilai halaman tidak bisa kurang dari 0 (nol).');
		}
		if (limit < 0 || typeof limit != "number") {
			reject('Jumlah row tiap halaman tidak bisa kurang dari 0 (nol).');
        }
		try {
            var utkinput = [''];
            var sambungwhere = "WHERE (dt_tender_peserta.tender_peserta_id != $1) ";
            if (katakunci != undefined && katakunci != null && katakunci != '') {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  ['', katakunci];
                sambungwhere = sambungwhere + "AND ((dt_tender_peserta.nama_peserta like $2) OR (LOWER(REPLACE(REPLACE(dt_tender_peserta.npwp,'.',''),'-','')) like $2)) ";
            } else {
                katakunci =  "%" + katakunci.toLowerCase() + "%";
                utkinput =  ['', katakunci];
                sambungwhere = sambungwhere + "AND (dt_tender_peserta.nama_peserta like $2) ";
            }
            var sambungorderby = "";
            var sambunglimitoffset = "";

            var nilaiasc = "DESC "; //descending
            if (sortbyasc == 1) {
                nilaiasc = "ASC ";  //ascending
            }
            if (sortby == 6) {
                sambungorderby = "ORDER BY dt_tender_peserta.nama_peserta " + nilaiasc;
            } else if (sortby == 7) {
                sambungorderby = "ORDER BY dt_tender_peserta.npwp " + nilaiasc;
            }
            if (page > 0 && limit > 0) {
                var pagenya = (page - 1) * limit;
                sambunglimitoffset = "LIMIT " + limit + " OFFSET " + pagenya;
            }
            if (filterby.length > 0) {
                if (filterby.length <= filter.length) {
                    var nilaiparam = 0;
                    for (var i=0;i<filterby.length;i++) {
                        nilaiparam = i+3;
                        if (filterby[i] == 7) {
                            sambungwhere = sambungwhere + "AND (LOWER(dt_tender_peserta.nama_peserta) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        } else if (filterby[i] == 8) {
                            sambungwhere = sambungwhere + "AND (LOWER(REPLACE(REPLACE(dt_tender_peserta.npwp,'.',''),'-','')) like $" + nilaiparam + ") ";
                            utkinput.push('%'+ filter[i].toLowerCase() + '%');
                        }
                    }
                } else {
                    reject("Filter by tidak bisa lebih besar dari Filter.");
                }
            }
            
            db.query("SELECT dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp, (SELECT count(*) as jumlahnya FROM (SELECT dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp FROM dt_tender_peserta FULL JOIN dt_badan_usaha ON dt_tender_peserta.npwp = dt_badan_usaha.bu_npwp " + sambungwhere + " GROUP BY dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp) as Jumlahnya) as jumlahsemua, COALESCE(dt_badan_usaha.bu_nama, '') as bu_nama, COALESCE(dt_badan_usaha.bu_alamat, '') as bu_alamat, COALESCE(dt_badan_usaha.bu_kabupaten, '') as bu_kabupaten, COALESCE(dt_badan_usaha.bu_kodepos, '') as bu_kodepos, COALESCE(dt_badan_usaha.bu_telepon, '') as bu_telepon, COALESCE(dt_badan_usaha.bu_fax, '') as bu_fax, COALESCE(dt_badan_usaha.bu_email, '') as bu_email, COALESCE(dt_badan_usaha.bu_website, '') as bu_website, COALESCE(dt_badan_usaha.bu_bentuk_badan_usaha, '') as bu_bentuk_badan_usaha, COALESCE(dt_badan_usaha.bu_jenis_badan_usaha, '') as bu_jenis_badan_usaha FROM dt_tender_peserta FULL JOIN dt_badan_usaha ON dt_tender_peserta.npwp = dt_badan_usaha.bu_npwp " + sambungwhere + " GROUP BY dt_tender_peserta.nama_peserta, dt_tender_peserta.npwp, dt_badan_usaha.bu_nama, dt_badan_usaha.bu_alamat, dt_badan_usaha.bu_kabupaten, dt_badan_usaha.bu_kodepos, dt_badan_usaha.bu_telepon, dt_badan_usaha.bu_fax, dt_badan_usaha.bu_email, dt_badan_usaha.bu_website, dt_badan_usaha.bu_bentuk_badan_usaha, dt_badan_usaha.bu_jenis_badan_usaha " + sambungorderby + sambunglimitoffset, utkinput).callback(function(err, response) {
                if (err) throw err;

                if (response.length > 0) {
                    var index = 0;
                    var jumlahdata = response[0].jumlahsemua;
                    async.each(response, function(isinya, callback) {
                        var buatjsonarr = {
                            nama_peserta: response[index].nama_peserta,
                            npwp: response[index].npwp,
                            bu_nama: response[index].bu_nama,
                            bu_alamat: response[index].bu_alamat,
                            bu_kabupaten: response[index].bu_kabupaten,
                            bu_kodepos: response[index].bu_kodepos,
                            bu_telepon: response[index].bu_telepon,
                            bu_fax: response[index].bu_fax,
                            bu_email: response[index].bu_email,
                            bu_website: response[index].bu_website,
                            bu_bentuk_badan_usaha: response[index].bu_bentuk_badan_usaha,
                            bu_jenis_badan_usaha: response[index].bu_jenis_badan_usaha
                            }
                        buatjson.push(buatjsonarr);
                        index = index + 1;
                        callback(null, "");
                    }, function(err) {
                        if (err) throw err;
                    });
                    if (buatjson.length > 0) {
                        self.json(JSON.parse(BalikanHeaderFINAL("true", "Berhasil buka data perusahaan.", "", "Total semua data: " + jumlahdata, JSON.stringify(req), receivetime, JSON.stringify(buatjson), jumlahdata)));					
                        resolve("Berhasil buka data perusahaan.");
                    } else {
                        reject("Tidak ada data tender.");
                    }
                } else {
                    reject("Tidak ada data tender.");
                }
        });
		} catch(err) {
			reject(err);
		}
	});
};