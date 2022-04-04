import networkx as nx
import random
import sys
import time
import names

num_node = int(sys.argv[1])
fa = open('account.csv', "w")
fc = open('customer.csv', "w")
ft = open('transaction.csv', "w")

fa.write('acc_id,cst_id\n')
fc.write('cst_id,first_name,last_name\n')
ft.write('acc_id_src,acc_id_dst,txn_id,datetime,amount\n')

graph = nx.gnp_random_graph(num_node, 20 / num_node, seed=0, directed=False)
print('Avg degree:', graph.number_of_edges() * 2 / graph.number_of_nodes())

# Account
for node in range(num_node):
    fa.write(','.join([
        str(node), # ID
        str(node % (int(num_node * 0.8))) # Customer ID
        ]) + '\n')

# Customer
for node in range(int(num_node * 0.8)):
    fc.write(','.join([
        str(node), # ID
        names.get_first_name(),
        names.get_last_name()
        ]) + '\n')

def random_date(proportion):
    format = '%Y-%m-%d %H:%M:%S'
    stime = time.mktime(time.strptime("2020-11-10 9:00:00", format))
    etime = time.mktime(time.strptime("2020-11-20 9:00:00", format))
    ptime = stime + proportion * (etime - stime)
    return time.strftime(format, time.localtime(ptime))

# Transaction
for node in range(num_node):
    neighbors = list(graph.neighbors(node))
    random.seed(node)
    num_edge = random.choice([10,20,30,40,50])
    for edge in range(num_edge):
        node_src = node
        random.seed(edge)
        node_dst = random.choice(neighbors)
        ft.write(','.join([
            str(node_src),
            str(node_dst),
            str(node_src * 100 + edge), # txn_id
            random_date(random.random()), # txn_time
            str(random.randrange(100, 1000, step=100)) # amount
            ]) + '\n')
