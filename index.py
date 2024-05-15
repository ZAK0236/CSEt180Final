from flask import Flask, render_template, request, redirect, url_for, flash
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, login_required, logout_user, login_user, UserMixin
import secrets
import hashlib

app = Flask(__name__)
app.secret_key = 'zak_super_secret_key'

app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:bcSd4y&689#Hb@localhost/Dulmes_Ecommerce'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

login_manager = LoginManager()
login_manager.init_app(app)


class Accounts(db.Model, UserMixin):
    User_ID = db.Column(db.Integer, primary_key=True, auto_increment=True, nullable=False)
    Account_Type = db.Column(db.String(255), nullable=False)
    Full_Name = db.Column(db.String(255), nullable=False)
    Email = db.Column(db.String(255), nullable=False, unique=True)
    SSN_or_EIN = db.Column(db.Integer, nullable=False,  unique=True)
    Address = db.Column(db.String(255), nullable=False)
    Phone_Number = db.Column(db.Integer, nullable=False, unique=True)
    Pass_Word = db.Column(db.String(255), nullable=False)
    Cart = db.relationship('Cart', backref='Accounts', lazy=True)
    Product = db.relationship('Product', backref='Accounts', lazy=True)
    OrderReceipt = db.relationship('Order_Receipt', backref='Accounts', lazy=True)
    Chat = db.relationship('Chat', backref='Accounts', lazy=True)
    Review = db.relationship('Review', backref='Accounts', lazy=True)
    OrdersReturned = db.relationship('Orders_Returned', backref='Accounts', lazy=True)
    Complaint = db.relationship('Complaint', backref='Accounts', lazy=True)

    def is_active(self):
        return True

    def __repr__(self):
        return f'<Account {self.User_ID}>'


class Product(db.Model, UserMixin):
    Product_ID = db.Column(db.Integer, primary_key=True, auto_increment=True, nullable=False)
    Full_Name = db.Column(db.String(255), db.ForeignKey('Accounts.Full_name', on_delete=db.CASCADE))
    Title = db.Column(db.String(255), nullable=False)
    Images = db.Column(db.String(500), nullable=False)
    Product_Description = db.Column(db.String(255), nullable=False)
    Warranty_Length = db.Column(db.String(255), nullable=False)
    Quantity = db.Column(db.Integer, nullable=False)
    Price = db.Column(db.Integer, nullable=False)
    Category = db.Column(db.String(255), nullable=False)
    Color = db.Column(db.String(255), nullable=False)
    Size = db.Column(db.String(255), nullable=False)
    Stock_Amt = db.Column(db.Integer, nullable=False)
    CartSummary = db.relationship('Cart_Summary', backref='Product', lazy=True)

    def __repr__(self):
        return f'<Product {self.Product_ID}>'


def hash_password(inputpw):
    return hashlib.sha3_256(inputpw.encode())


@app.route('/signup', methods=['GET', 'POST'])
def signup():
    if request.method == 'POST':
        user_id = request.form['user_id']
        existing_user = Accounts.query.filter_by(user_id=user_id).first()
        if existing_user:
            flash('User ID already exists. Please choose a different one.', 'error')
            return redirect(url_for('signup'))
        account_type = request.form['account_type']
        full_name = request.form['full_name']
        email = request.form['email']
        ssn_or_ein = request.form['ssn_or_ein']
        address = request.form['address']
        phone_number = request.form['phone_number']
        pass_word = request.form['pass_word']
        pass_word = hash_password(pass_word).hexdigest()

        new_user = Accounts(user_id=user_id, account_type=account_type, full_name=full_name,
                            email=email, ssn_or_ein=ssn_or_ein, address=address, phone_number=phone_number,
                            pass_word=pass_word)
        db.session.add(new_user)
        db.session.commit()

        return redirect(url_for('signup_success'))

    return render_template('signup.html')


def generate_user_id():
    length = 3
    account_number = ''.join(secrets.choice('0123456789') for i in range(length))
    return account_number


@app.route('/signup_success')
def signup_success():
    return "Signup Was Successful!"


@app.route('/base', methods=['GET', 'POST'])
def base():
    if request.method == 'POST':
        user_id = request.form['user_id']
        pass_word = request.form['pass_word']
        accounts = Accounts.query.filter_by(user_id=user_id).first()

        if accounts and Accounts.pass_word == pass_word:
            login_user(accounts)
            flash('Login successful', 'success')
            return redirect(url_for('home'))
        else:
            flash('Invalid username or password', 'error')
            return redirect(url_for('base'))
    else:
        return render_template('base.html')


@app.route('/add-product', methods=['GET','POST'])
def add_product():
        if request.methods=='GET':
        product_id = request.form['product_id']
        full_name = request.form['full_name']
        title = request.form['title']
        images = request.form['images']
        product_description = request.form['product_description']
        warranty_length = request.form['warranty_length']
        price = request.form['price']
        category = request.form['category']
        color = request.form['color']
        size = request.form['size']
        stock_amt = request.form['stock_amt']
# else:
#     flash('User ID already exists. Please choose a different one.', 'error')
#     return redirect(url_for('product'))


@app.route('/delete', methods=['GET','POST'])
def delete_get_request():
    conn.execute(text("DELETE from Dulmes_Ecommerce where product_id = :product_id"), request.form)
    conn.commit()
    return render_template('delete.html')

@app.route('/logout')
@login_required
def logout():
    logout_user()
    return redirect(url_for('base'))


if __name__ == '__main__':
    app.run(debug=True)
