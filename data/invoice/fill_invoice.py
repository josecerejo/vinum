from appy.pod.renderer import Renderer

items = [('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$'),
         ('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$'),
         ('12', 'ROU724 Valle D\'Oro Rosso .. 2009', '750 ml', '1.59$', '19.08$')]

renderer = Renderer('vinum_invoice_tmpl.odt', globals(), '/tmp/vinum/invoice1.pdf', overwriteExisting=True)
renderer.run()
