var express = require("express");
var router = express.Router();
var http = require("http");
var fs = require("fs");
var fileUpload = require('express-fileupload');
var path = require('path');
var formidable = require("formidable");
const check = require('express-validator/check').check;
const validationResult = require('express-validator/check').validationResult;
var mv = require("mv");
var authentication_mdl = require("../middlewares/authentication");
var session_store;
/* GET Customer page. */

router.get("/", authentication_mdl.is_login, function (req, res, next) {
  req.getConnection(function (err, connection) {
    var query = connection.query(
      "SELECT * FROM customer",
      function (err, rows) {
        if (err) var errornya = ("Error Selecting : %s ", err);
        req.flash("msg_error", errornya);
        res.render("customer/list", {
          title: "Customers",
          data: rows,
          session_store: req.session,
        });
      }
    );
    //console.log(query.sql);
  });
});

router.delete(
  "/delete/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var customer = {
        id: req.params.id,
      };

      var delete_sql = "delete from customer where ?";
      req.getConnection(function (err, connection) {
        var query = connection.query(
          delete_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Delete : %s ", err);
              req.flash("msg_error", errors_detail);
              res.redirect("/customers");
            } else {
              req.flash("msg_info", "Delete Customer Success");
              res.redirect("/customers");
            }
          }
        );
      });
    });
  }
);
router.get(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.getConnection(function (err, connection) {
      var query = connection.query(
        "SELECT * FROM customer where id=" + req.params.id,
        function (err, rows) {
          if (err) {
            var errornya = ("Error Selecting : %s ", err);
            req.flash("msg_error", errors_detail);
            res.redirect("/customers");
          } else {
            if (rows.length <= 0) {
              req.flash("msg_error", "Customer can't be find!");
              res.redirect("/customers");
            } else {
              console.log(rows);
              res.render("customer/edit", {
                title: "Edit ",
                data: rows[0],
                session_store: req.session,
              });
            }
          }
        }
      );
    });
  }
);
router.put(
  "/edit/(:id)",
  authentication_mdl.is_login,
  function (req, res, next) {
    req.assert("judul", "Please fill the judul").notEmpty();
    var errors = req.validationErrors();
    if (!errors) {
      v_judul = req.sanitize("judul").escape().trim();
      v_waktu = req.sanitize("waktu").escape().trim();
      v_studio = req.sanitize("studio").escape().trim();
      v_kursi = req.sanitize("kursi").escape().trim();
      v_harga = req.sanitize("harga").escape();

      if (!req.files) {
        var customer = {
          judul: v_judul,
          waktu: v_waktu,
          studio: v_studio,
          kursi: v_kursi,
          harga: v_harga,
          };
      }else{
        var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

        var customer = {
          judul: v_judul,
          waktu: v_waktu,
          studio: v_studio,
          kursi: v_kursi,
          harga: v_harga,
          gambar: file.name,
        };
      }

      var update_sql = "update customer SET ? where id = " + req.params.id;
      req.getConnection(function (err, connection) {
        var query = connection.query(
          update_sql,
          customer,
          function (err, result) {
            if (err) {
              var errors_detail = ("Error Update : %s ", err);
              req.flash("msg_error", errors_detail);
              res.render("customer/edit", {
                judul: req.param("judul"),
                waktu: req.param("waktu"),
                studio: req.param("studio"),
                kursi: req.param("kursi"),
                harga: req.param("harga"),
                gambar: req.param("gambar"),
              });
            } else {
              req.flash("msg_info", "Update customer success");
              res.redirect("/customers");
            }
          }
        );
      });
    } else {
      console.log(errors);
      errors_detail = "<p>Sory there are error</p><ul>";
      for (i in errors) {
        error = errors[i];
        errors_detail += "<li>" + error.msg + "</li>";
      }
      errors_detail += "</ul>";
      req.flash("msg_error", errors_detail);
      res.redirect("/customers/edit/" + req.params.id);
    }
  }
);

router.post("/add", authentication_mdl.is_login, function (req, res, next) {
  req.assert("judul", "Please fill the judul").notEmpty();
  var errors = req.validationErrors();
  if (!errors) {
    v_judul = req.sanitize("judul").escape().trim();
    v_waktu = req.sanitize("waktu").escape().trim();
    v_studio = req.sanitize("studio").escape().trim();
    v_kursi = req.sanitize("kursi").escape().trim();
    v_harga = req.sanitize("harga").escape();

    var file = req.files.gambar;
        file.mimetype == "image/jpeg";
        file.mv("public/images/upload/" + file.name);

    var customer = {
      judul: v_judul,
      waktu: v_waktu,
      studio: v_studio,
      kursi: v_kursi,
      harga: v_harga,
      gambar: file.name,
    };

    var insert_sql = "INSERT INTO customer SET ?";
    req.getConnection(function (err, connection) {
      var query = connection.query(
        insert_sql,
        customer,
        function (err, result) {
          if (err) {
            var errors_detail = ("Error Insert : %s ", err);
            req.flash("msg_error", errors_detail);
            res.render("customer/add-customer", {
              judul: req.param("judul"),
              waktu: req.param("waktu"),
              studio: req.param("studio"),
              kursi: req.param("kursi"),
              harga: req.param("harga"),
              session_store: req.session,
            });
          } else {
            req.flash("msg_info", "Create customer success");
            res.redirect("/customers");
          }
        }
      );
    });
  } else {
    console.log(errors);
    errors_detail = "<p>Sory there are error</p><ul>";
    for (i in errors) {
      error = errors[i];
      errors_detail += "<li>" + error.msg + "</li>";
    }
    errors_detail += "</ul>";
    req.flash("msg_error", errors_detail);
    res.render("customer/add-customer", {
      judul: req.param("judul"),
      studio: req.param("studio"),
      session_store: req.session,
    });
  }
});

router.get("/add", authentication_mdl.is_login, function (req, res, next) {
  res.render("customer/add-customer", {
    title: "Add New Customer",
    judul: "",
    waktu: "",
    studio: "",
    kursi: "",
    harga: "",
    session_store: req.session,
  });
});

module.exports = router;
